import {Node} from "../../notcompose/runtime/Node";
import {Composer} from "../../notcompose/runtime/Composer";
import {applyLayoutNode} from "./applyLayoutNode";
import {withComposer} from "../../notcompose/runtime/currentComposer";

import {Constraints} from "../runtime/layout/Constraints";
import {
    RecomposeLambda,
    RecomposeLambdaExtensionKey
} from "../../notcompose/runtime-plugins/partialRecomposition/RecomposeLambda";
import {LayoutProcessorPluginDebug} from "./LayoutProcessorPlugin";

export class LayoutProcessor {
    constructor(
        // todo Subject to remove.
        private readonly params: {
            interceptMeasurement: (invoke: () => void) => void,
            interceptPlacement: (invoke: () => void) => void,
        } = {
            interceptMeasurement: it => it(),
            interceptPlacement: it => it(),
        }
    ) {}

    // composer используется для Subconstraints/Subcompose
    layout(node: Node, composer: Composer, constraints: Constraints) {
        const plugin = new LayoutProcessorPluginDebug()

        const coordinator = applyLayoutNode(node, (content, node) => {
            withComposer(composer, () => {
                composer.startRootNode(node)
                composer.applyExtension(RecomposeLambdaExtensionKey, content satisfies RecomposeLambda)
                composer.startComposingNode()
                content()
                composer.endComposingNode()
                composer.endRootNode()
            })
        })

        this.params.interceptMeasurement(() => coordinator.measure(plugin, constraints))

        this.params.interceptPlacement(() => coordinator.place(0, 0, 0))
    }
}
