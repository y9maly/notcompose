import { type ModifierElement, Node } from '@notcompose/core'
import { MeasurePolicy } from '../MeasurePolicy.js'
import { BaseLayoutNodeCoordinator } from './LayoutNodeCoordinator.js'

export class InnerLayoutNodeCoordinator extends BaseLayoutNodeCoordinator {
    constructor(
        private _node: Node,
        private _modifierElements: ReadonlyArray<ModifierElement>,
        private _measurePolicy: MeasurePolicy,
    ) { super() }

    get node() {
        return this._node
    }

    get modifierElements(): ReadonlyArray<ModifierElement> {
        return this._modifierElements
    }

    get measurePolicy() {
        return this._measurePolicy
    }

    updateNode(value: Node) {
        this._node = value
    }

    updateModifierElements(value: ReadonlyArray<ModifierElement>) {
        this._modifierElements = value
    }

    updateMeasurePolicy(value: MeasurePolicy) {
        this._measurePolicy = value
    }
}
