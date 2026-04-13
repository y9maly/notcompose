import * as fs from "node:fs";
import {Recomposer} from "../notcompose/runtime-recomposer/Recomposer";
import * as NotcomposeRuntimeDebug from "../notcompose/runtime/debug";
import * as Console from "node:console";
import {Composer} from "../notcompose/runtime/Composer";
import {PluginVerifierPlugin} from "../notcompose/runtime-plugins/pluginVerifier/PluginVerifierPlugin";
import {DirtyCompositionPlugin} from "../notcompose/runtime-plugins/dirtyComposition/DirtyCompositionPlugin";
import {StateReadsPlugin} from "../notcompose/runtime-plugins/stateReads/StateReadsPlugin";
import {RememberObserverPlugin} from "../notcompose/runtime-plugins/rememberObserver/RememberObserverPlugin";
import {Composition} from "./Composition";
import {InputProcessor} from "./runtime-input/InputProcessor";
import {RootInputDispatcher} from "./runtime-input/InputDispatcher";
import {LayoutProcessor} from "./runtime-layout/LayoutProcessor";
import {ConsoleOutputProcessor} from "./runtime-output/OutputProcessor";
import {Constraints} from "./runtime/layout/measure";
import {Modifier} from "../notcompose/runtime/Modifier";
import {SizeInModifier} from "./runtime/modifiers/SizeModifier";
import {NameElement} from "../notcompose/runtime/modifiers/NameElement";

const appLogStream = fs.createWriteStream('./app.log')
const appLogConsole = new Console.Console({ stdout: appLogStream, stderr: appLogStream })
NotcomposeRuntimeDebug.setDebugConsole(appLogConsole)

export function setTerminalContent(content: () => void) {
    const recomposer = new Recomposer()
    const composer = new Composer([
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

    const composition = new Composition(composer)

    // Обходит дерево, ищет на ноды с InputModifier для обработки ввода с клавиатуры
    const inputProcessor = new InputProcessor(new RootInputDispatcher(
        () => composition.rootNode
    ))
    inputProcessor.start()

    // Обходит дерево, измеряет ноды (layout/measurement + layout/placement фазы)
    const layoutProcessor = new LayoutProcessor()

    // Рисует кадр в console
    // Перед отрисовкой нужно сделать remeasure: вызвать layoutProcessor.layout()
    const outputProcessor = new ConsoleOutputProcessor(process.stdout, {
        before: () => {
            console.clear()
            // '\x1b[2J\x1b[H', '\r\x1B[?25l'
            process.stdout.write('\r\x1B[?25l')
        },
        after: () => {
            process.stdout.write('\r')
        }
    })

    composition.setContent(content)

    let rootConstraints = new Constraints(0, process.stdout.columns, 0, process.stdout.rows)

    function recompose() {
        composition.compose(new Modifier([
            SizeInModifier({
                maxWidth: process.stdout.columns,
                maxHeight: process.stdout.rows,
            }),
            new NameElement('Root')
        ]))

        layoutProcessor.layout(composition.rootNode, composer, rootConstraints)
        outputProcessor.doFrame(composition.rootNode, process.stdout.columns, process.stdout.rows)
    }

    recompose()

    process.stdout.on('resize', () => {
        rootConstraints = new Constraints(0, process.stdout.columns, 0, process.stdout.rows)
        recompose()
    })

    setInterval(() => {
        if (recomposer.needRecompose()) {
            recomposer.recompose(composer)

            layoutProcessor.layout(composition.rootNode, composer, rootConstraints)
            outputProcessor.doFrame(composition.rootNode, process.stdout.columns, process.stdout.rows)
        }
    }, 1000 / 30) // debounce to 30 FPS
}
