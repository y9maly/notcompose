import {LayoutModifier} from "./LayoutModifier.js";
import {Constraints, Measurable, MeasureResult} from "../layout/measure.js";
import {ModifierElement} from "../../../notcompose/runtime/Modifier";


export function OffsetModifier(x: number, y: number): ModifierElement {
    return new OffsetModifierImpl(x, y)
}

export function OffsetXModifier(offset: number): ModifierElement {
    return new OffsetModifierImpl(offset, 0)
}

export function OffsetYModifier(offset: number): ModifierElement {
    return new OffsetModifierImpl(0, offset)
}

class OffsetModifierImpl implements LayoutModifier {
    [LayoutModifier.symbol] = this;

    constructor(
        private x: number,
        private y: number,
    ) {}

    measure(measurable: Measurable, constraints: Constraints): MeasureResult {
        const placeable = measurable.measure(constraints)
        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(this.x, this.y)
        })
    }

    equals(other: ModifierElement): boolean {
        return other instanceof OffsetModifierImpl
            && this.x === other.x
            && this.y === other.y
    }
}
