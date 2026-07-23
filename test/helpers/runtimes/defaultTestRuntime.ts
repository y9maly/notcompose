import { TestRuntime } from '../core/TestRuntime.js'
import { CleanCompositionPlugin, Composer, PluginVerifierPlugin, Recomposer, RememberObserverPlugin, StateReadsPlugin } from 'notcompose'
import { Composition } from 'notcompose/terminal'

export function defaultTestRuntime(): TestRuntime {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        new PluginVerifierPlugin(),
        new CleanCompositionPlugin(),
        new StateReadsPlugin(recomposer),
        new RememberObserverPlugin(),
    ])

    const composition = new Composition(composer)

    const runtime = new TestRuntime(composition.rootNode, composer, composition)
    runtime['recomposer'] = recomposer

    return runtime
}
