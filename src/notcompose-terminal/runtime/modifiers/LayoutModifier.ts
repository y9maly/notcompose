import {Constraints, Measurable, MeasureResult} from "../layout/measure.js";
import {ModifierElement} from "../../../notcompose/runtime/Modifier";


export interface LayoutModifier extends ModifierElement {
    measure(measurable: Measurable, constraints: Constraints): MeasureResult
}

const symbol = Symbol()
LayoutModifier.symbol = symbol
LayoutModifier.of = (o: unknown): LayoutModifier | null => {
    if (!o || typeof o !== 'object' || !(LayoutModifier.symbol in o)) return null
    return o[LayoutModifier.symbol] as LayoutModifier
}

export function LayoutModifier(
    measure: (measurable: Measurable, constraints: Constraints) => MeasureResult
): LayoutModifier {
    return new LayoutModifierImpl(measure)
}

class LayoutModifierImpl implements LayoutModifier {
    [LayoutModifier.symbol] = this;

    constructor(
        public measure: (measurable: Measurable, constraints: Constraints) => MeasureResult
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof LayoutModifierImpl && other.measure === this.measure
    }
}
