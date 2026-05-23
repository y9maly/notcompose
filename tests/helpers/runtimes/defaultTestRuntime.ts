import {TestRuntime} from "../core/TestRuntime";
import {Recomposer} from "../../../src/notcompose/runtime-recomposer/Recomposer";
import {Composer} from "../../../src/notcompose/runtime/Composer";
import {PluginVerifierPlugin} from "../../../src/notcompose/runtime-plugins/pluginVerifier/PluginVerifierPlugin";
import {DirtyCompositionPlugin} from "../../../src/notcompose/runtime-plugins/dirtyComposition/DirtyCompositionPlugin";
import {StateReadsPlugin} from "../../../src/notcompose/runtime-plugins/stateReads/StateReadsPlugin";
import {RememberObserverPlugin} from "../../../src/notcompose/runtime-plugins/rememberObserver/RememberObserverPlugin";
import {Node} from "../../../src/notcompose/runtime/Node";
import {Modifier} from "../../../src/notcompose/runtime/Modifier";
import {NameElement} from "../../../src/notcompose/runtime/modifiers/NameElement";


export function defaultTestRuntime(): TestRuntime {
    const recomposer = new Recomposer()
    const composer = new Composer([
        new PluginVerifierPlugin(),
        new DirtyCompositionPlugin(),
        new StateReadsPlugin(recomposer),
        new RememberObserverPlugin(),
    ])

    const rootNode = new Node(
        null,
        new Modifier([new NameElement('Root')]),
    )

    const runtime = new TestRuntime(rootNode, composer)
    runtime['recomposer'] = recomposer

    return runtime
}