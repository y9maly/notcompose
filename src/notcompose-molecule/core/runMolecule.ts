import {State} from "../../notcompose/runtime/State";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {BehaviorSubject, Subject} from "rxjs";
import {Recomposer} from "../../notcompose/runtime-recomposer/Recomposer";
import {Composer} from "../../notcompose/runtime/Composer";
import {PluginVerifierPlugin} from "../../notcompose/runtime-plugins/pluginVerifier/PluginVerifierPlugin";
import {DirtyCompositionPlugin} from "../../notcompose/runtime-plugins/dirtyComposition/DirtyCompositionPlugin";
import {StateReadsPlugin} from "../../notcompose/runtime-plugins/stateReads/StateReadsPlugin";
import {RememberObserverPlugin} from "../../notcompose/runtime-plugins/rememberObserver/RememberObserverPlugin";
import {Composition} from "../../notcompose-terminal/Composition";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {NameElement} from "../../notcompose/runtime/modifiers/NameElement";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";


const Empty = Symbol('Empty')
export function runMolecule<T>(content: () => T): State<T> {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        // Для дебага, кинет исключение если методы плагинов вызовутся неправильно
        new PluginVerifierPlugin(),
        // Удаляет пометку о грязной ноде сразу после начала композиции
        new DirtyCompositionPlugin(),
        // Отслеживает чтения стейтов во время композиции;
        // Составляет список стейтов от которых зависит каждая нода;
        // Позже используется для рекомпозиции при изменении стейта;
        // + recomposer помечает ноду грязной при изменении стейтов, от которых она зависит
        new StateReadsPlugin(recomposer),
        // Вызывает onRemembered и onForgotten для запомненых объектов реализующих RememberObserver
        // В частности это нужно для работы LaunchedEffect и DisposableEffect (см. исходники)
        new RememberObserverPlugin(),
    ])

    const state = mutableStateOf<T | typeof Empty>(Empty)
    const composition = new Composition(composer)
    composition.setContent(() => {
        state.value = content()
    })

    function recompose() {
        composition.compose(new Modifier([
            new NameElement('Root')
        ]))
    }

    recompose();

    (async () => {
        // noinspection InfiniteLoopJS
        while (true) {
            await recomposer.awaitNeedRecompose()
            recomposer.recompose(composer)
        }
    })()

    if (state.value === Empty)
        throw new Error('State cannot be empty')
    return state as State<T>
}
