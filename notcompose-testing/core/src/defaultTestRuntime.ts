import { CleanCompositionPlugin, Composer, ComposerApplierPlugin, ComposerVerifierPlugin, CompositionSessionDefault, CurrentComposerRecomputeScope, Recomposer, RecomputeScopeApplierPlugin, RememberObserverPlugin, StateReadsPlugin } from '@notcompose/core'
import { TestRuntime } from './TestRuntime.js'
import { TestCompositionRunner } from './TestCompositionRunner.js'

export function defaultTestRuntime(): TestRuntime {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        new ComposerVerifierPlugin(),
        new CleanCompositionPlugin(),
        new StateReadsPlugin(recomposer),
        new RememberObserverPlugin(),
    ])

    const compositionSession = new CompositionSessionDefault(composer, [
        new RecomputeScopeApplierPlugin(CurrentComposerRecomputeScope),
        new ComposerApplierPlugin(),
    ])

    const compositionRunner = new TestCompositionRunner(compositionSession)

    const runtime = new TestRuntime(compositionRunner.rootNode, composer, compositionSession, compositionRunner)
    runtime.recomposer = recomposer

    return runtime
}
