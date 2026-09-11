import { CleanCompositionPlugin, Composer, ComposerCompositionPlugin, ComposerVerifierPlugin, CompositionSessionDefault, ComposerRecomputeScope, Modifier, mutableStateOf, NameModifier, Recomposer, RecomputeScopeApplierPlugin, RememberObserverPlugin, type State, StateReadsPlugin } from '@notcompose/core'
import { MoleculeCompositionRunner } from './MoleculeCompositionRunner.js'

export function runMolecule<T>(content: () => T): [State<T>, dispose: () => void]
export function runMolecule<T>(signal: AbortSignal, content: () => T): State<T>
export function runMolecule<T>(a: AbortSignal | (() => T), b?: () => T): [State<T>, dispose: () => void] | State<T> {
    if (arguments.length === 2)
        return runMoleculeImpl(a as AbortSignal, b!)
    const abortController = new AbortController()
    const state = runMoleculeImpl(abortController.signal, a as () => T)
    return [state, () => abortController.abort()]
}

function runMoleculeImpl<T>(signal: AbortSignal, content: () => T): State<T> {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        // Для дебага, кинет исключение если методы плагинов вызовутся неправильно
        new ComposerVerifierPlugin(),
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

    const state = mutableStateOf<T | undefined>(undefined)

    const compositionSession = new CompositionSessionDefault([
        new RecomputeScopeApplierPlugin(new ComposerRecomputeScope(composer)),
        new ComposerCompositionPlugin(composer),
    ])

    const composition = new MoleculeCompositionRunner(compositionSession)
    composition.setContent(() => {
        state.value = content()
    })

    function recompose() {
        composition.compose(Modifier.then(NameModifier('Root')))
    }

    recompose()

    const abortPromise = new Promise<true>((resolve) => {
        signal.addEventListener('abort', () => resolve(true), { once: true })
        if (signal.aborted) resolve(true)
    })

    void (async () => {
        // noinspection InfiniteLoopJS
        while (true) {
            const aborted = await Promise.race([abortPromise, recomposer.awaitNeedRecompose() satisfies Promise<void>])
            if (aborted === true)
                break
            recomposer.recompose(compositionSession)
        }
    })()

    return state as State<T>
}
