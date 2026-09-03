import { Node, NodeExtensionKey } from 'notcompose'
import { MeasurePolicy } from '../MeasurePolicy.js'
import type { LayoutNodeCoordinator } from './LayoutNodeCoordinator.js'

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
