import {NodeExtensionKey} from "../../../notcompose/runtime/NodeExtensionKey";
import {Measurable} from "../Measurable";
import {LayoutModifierLayoutNodeCoordinator} from "./LayoutModifierLayoutNodeCoordinator";
import {Node} from "../../../notcompose/runtime/Node";
import {MeasurePolicy} from "../MeasurePolicy";
import {LayoutNodeCoordinator} from "./LayoutNodeCoordinator";

export const LayoutNodeExtensionKey = new NodeExtensionKey<LayoutNode>('LayoutNode')

export class LayoutNode {
    constructor(
        private _node: Node,
        private _outerCoordinator: LayoutNodeCoordinator,
        private _measurePolicy: MeasurePolicy,
    ) {}

    get node() {
        return this._node
    }

    get outerCoordinator() {
        return this._outerCoordinator
    }

    get measurePolicy() {
        return this._measurePolicy
    }

    updateNode(value: Node) {
        this._node = value
    }

    updateOuterCoordinator(value: LayoutNodeCoordinator) {
        this._outerCoordinator = value
    }

    updateMeasurePolicy(value: MeasurePolicy) {
        this._measurePolicy = value
    }
}

// interface LayoutNodeConstructor {
//     new (): LayoutNode
// }
//
// class LayoutNodeImpl implements LayoutNode {
//
// }
//
// export const LayoutNode: LayoutNodeConstructor = LayoutNodeImpl
