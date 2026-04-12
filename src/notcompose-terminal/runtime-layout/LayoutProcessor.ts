import {Node} from "../../notcompose/runtime/Node";
import {Composer} from "../../notcompose/runtime/Composer";
import {applyNodeCoordinator} from "./applyNodeCoordinator";
import {currentComposerOrNull, setCurrentComposer} from "../../notcompose/runtime/currentComposer";
import {Constraints} from "../runtime/layout/measure";


export class LayoutProcessor {
    constructor() {}

    // composer используется для Subconstraints/Subcompose
    layout(node: Node, composer: Composer, constraints: Constraints) {
        const coordinator = applyNodeCoordinator(node, (content, node) => {
            const previousComposer = currentComposerOrNull()
            setCurrentComposer(composer)
            composer.startRootNode(node)
            composer.startComposingNode()
            content()
            composer.endComposingNode()
            composer.endRootNode()
            setCurrentComposer(previousComposer)
        })
        coordinator.measure(constraints)
        coordinator.place(0, 0)
    }
}
