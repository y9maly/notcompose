import {ModifierElement} from "../../notcompose/runtime/Modifier";
import {BaseLayoutNodeCoordinator, LayoutNodeCoordinator} from "./LayoutNodeCoordinator";
import {LayoutModifier} from "../../notcompose-terminal/runtime/modifiers/LayoutModifier";
import {MeasureResult} from "../../notcompose-terminal/runtime/layout/Measurable";

export class LayoutModifierLayoutNodeCoordinator extends BaseLayoutNodeCoordinator {
    constructor(
        private _modifierElements: ReadonlyArray<ModifierElement>,
        private _layoutModifier: LayoutModifier,
        private _next: LayoutNodeCoordinator,
    ) { super() }

    get modifierElements(): ReadonlyArray<ModifierElement> {
        return this._modifierElements
    }

    get layoutModifier() {
        return this._layoutModifier
    }

    get nextCoordinator() {
        return this._next
    }

    updateModifierElements(value: ReadonlyArray<ModifierElement>) {
        this._modifierElements = value
    }

    updateLayoutModifier(value: LayoutModifier) {
        this._layoutModifier = value
    }

    updateNext(value: LayoutNodeCoordinator) {
        this._next = value
    }
}
