import {InputProcessor} from "./runtime-input/InputProcessor";
import {OutputProcessor} from "./runtime-output/OutputProcessor";
import {Recomposer} from "../notcompose/runtime-recomposer/Recomposer";
import {Composer} from "../notcompose/runtime/Composer";
import {PluginVerifierPlugin} from "../notcompose/runtime-plugins/pluginVerifier/PluginVerifierPlugin";
import {DirtyCompositionPlugin} from "../notcompose/runtime-plugins/dirtyComposition/DirtyCompositionPlugin";
import {StateReadsPlugin} from "../notcompose/runtime-plugins/stateReads/StateReadsPlugin";
import {RememberObserverPlugin} from "../notcompose/runtime-plugins/rememberObserver/RememberObserverPlugin";
import {Composition} from "./Composition";
import {LayoutProcessor} from "./runtime-layout/LayoutProcessor";
import {Constraints} from "./runtime/layout/Constraints";
import {Modifier} from "../notcompose/runtime/Modifier";
import {NameElement} from "../notcompose/runtime/modifiers/NameElement";

type StartParams = {
    inputProcessor: InputProcessor
    outputProcessor: OutputProcessor
    fps: number | 'unlimited' | 'manual'
    redrawOnViewportResize: boolean
}

type StartResult = {
    recompose(): void
    relayout(): void
    redraw(): void
}

/**
 * todo Subject to change
 */
export function bootstrapTerminalComposition(): {
    composer: Composer
    recomposer: Recomposer
    composition: Composition
    start(params: StartParams): StartResult
    stop(): void
} {
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

    const composition = new Composition(composer)

    // Обходит дерево, измеряет ноды (layout/measurement + layout/placement фазы)
    const layoutProcessor = new LayoutProcessor()

    let isStopped = false
    let isStarted = false
    // let onStop!: () => void
    // const stopHandler = new Promise<void>(resolve => onStop = resolve)

    const stop = () => {
        isStopped = true
        // onStop()
    }

    const start = (params: StartParams): StartResult => {
        if (params.fps !== 'unlimited' && params.fps !== 'manual') {
            if (params.fps < 0)
                throw new Error('FPS limit cannot be negative')
        }

        if (isStarted)
            throw new Error('start cannot be called twice')
        isStarted = true
        if (isStopped)
            throw new Error('start cannot be called after stop')

        params.inputProcessor.start()

        const currentWidth = () =>
            params.outputProcessor.viewportSize.value[0]
        const currentHeight = () =>
            params.outputProcessor.viewportSize.value[1]
        const currentConstraints = () =>
            new Constraints(0, currentWidth(), 0, currentHeight())

        const recompose = () => {
            composition.compose(new Modifier([new NameElement('Root')]))
        }

        const relayout = () => {
            layoutProcessor.layout(composition.rootNode, composer, currentConstraints())
        }

        const redraw = () => {
            params.outputProcessor.doFrame(composition.rootNode, currentWidth(), currentHeight())
        }

        if (params.redrawOnViewportResize) {
            // todo memory leak.
            params.outputProcessor.viewportSize.subscribe(_ => {
                recompose()
                relayout()
                redraw()
            });
        }

        (async () => {
            if (params.fps === 'unlimited') {
                while (!isStopped) {
                    await recomposer.awaitNeedRecompose()
                    if (isStopped)
                        break
                    recompose()
                    relayout()
                    redraw()
                }
            } else if (params.fps !== 'manual') {
                const intervalCallback = () => {
                    if (recomposer.needRecompose()) {
                        recompose()
                        relayout()
                        redraw()
                    }
                }

                if (params.fps > 0) {
                    const interval = setInterval(() => {
                        if (isStopped) {
                            clearInterval(interval)
                        } else {
                            intervalCallback()
                        }
                    }, 1000 / params.fps)
                }
            }
        })()

        return {
            recompose,
            relayout,
            redraw,
        }
    }

    return {
        composer,
        recomposer,
        composition,
        start,
        stop,
    }
}
