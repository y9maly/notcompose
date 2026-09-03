import { CleanCompositionPlugin, Composer, PluginVerifierPlugin, Recomposer, RememberObserverPlugin, StateReadsPlugin } from '@notcompose/core'
import { TestRuntime } from './TestRuntime.js'
import { TestComposition } from './TestComposition.js'

export function defaultTestRuntime(): TestRuntime {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        new PluginVerifierPlugin(),
        new CleanCompositionPlugin(),
        new StateReadsPlugin(recomposer),
        new RememberObserverPlugin(),
    ])

    const composition = new TestComposition(composer)

    const runtime = new TestRuntime(composition.rootNode, composer, composition)
    runtime['recomposer'] = recomposer

    return runtime
}
