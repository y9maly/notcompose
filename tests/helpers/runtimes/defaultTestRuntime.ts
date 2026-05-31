import {TestRuntime} from "../core/TestRuntime";
import {Recomposer} from "../../../src/notcompose/runtime-recomposer/Recomposer";
import {Composer} from "../../../src/notcompose/runtime/Composer";
import {PluginVerifierPlugin} from "../../../src/notcompose/runtime-plugins/pluginVerifier/PluginVerifierPlugin";
import {CleanCompositionPlugin} from "../../../src/notcompose/runtime-plugins/dirtyComposition/CleanCompositionPlugin";
import {StateReadsPlugin} from "../../../src/notcompose/runtime-plugins/stateReads/StateReadsPlugin";
import {RememberObserverPlugin} from "../../../src/notcompose/runtime-plugins/rememberObserver/RememberObserverPlugin";
import {Composition} from "../../../src/notcompose-terminal/Composition";

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