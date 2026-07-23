import { CleanCompositionPlugin, Composer, Modifier, mutableStateOf, NameModifier, PluginVerifierPlugin, Recomposer, RememberObserverPlugin, State, StateReadsPlugin } from 'notcompose'
import { Composition } from 'notcompose/terminal'

const Empty = Symbol('Empty')
export function runMolecule<T>(content: () => T): State<T> {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        // Для дебага, кинет исключение если методы плагинов вызовутся неправильно
        new PluginVerifierPlugin(),
        // Удаляет пометку о грязной ноде сразу после начала композиции
        new CleanCompositionPlugin(),
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
        composition.compose(Modifier.then(NameModifier('Root')))
    }

    recompose()

    void (async () => {
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
