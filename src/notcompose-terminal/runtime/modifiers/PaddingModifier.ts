import {Constraints, Measurable, MeasureResult} from "../layout/measure.js";
import {LayoutModifier} from "./LayoutModifier.js";
import {ModifierElement} from "../../../notcompose/runtime/Modifier";


export function PaddingModifier(all: number): ModifierElement
export function PaddingModifier(horizontal: number, vertical: number): ModifierElement
export function PaddingModifier(start: number, top: number, end: number, bottom: number): ModifierElement
export function PaddingModifier(
    paddingValues:
        | { all?: number }
        | { vertical?: number, horizontal?: number }
        | { vertical?: number, start?: number, end?: number }
        | { horizontal?: number, top?: number, bottom?: number }
        | { start?: number, top?: number, end?: number, bottom?: number }
): ModifierElement

export function PaddingModifier(
    a:
        | number
        | { all?: number }
        | { vertical?: number, horizontal?: number }
        | { vertical?: number, start?: number, end?: number }
        | { horizontal?: number, top?: number, bottom?: number }
        | { start?: number, top?: number, end?: number, bottom?: number },
    b?: number,
    c?: number,
    d?: number,
): ModifierElement {
    let start, top, end, bottom;
    if (typeof a === 'object') {
        const paddingValues: any = a
        start = paddingValues.start ?? paddingValues.horizontal ?? paddingValues.all ?? 0
        end = paddingValues.end ?? paddingValues.horizontal ?? paddingValues.all ?? 0
        bottom = paddingValues.bottom ?? paddingValues.vertical ?? paddingValues.all ?? 0
        top = paddingValues.top ?? paddingValues.vertical ?? paddingValues.all ?? 0
    } else if (b === undefined) {
        start = top = end = bottom = a
    } else if (c === undefined || d === undefined) {
        start = end = a
        top = bottom = b
    } else {
        start = a; top = b; end = c; bottom = d
    }

    return new PaddingModifierImpl(start, top, end, bottom)
}

class PaddingModifierImpl implements LayoutModifier {
    [LayoutModifier.symbol] = this;

    constructor(
        public start: number,
        public top: number,
        public end: number,
        public bottom: number,
    ) {}

    measure(measurable: Measurable, constraints: Constraints): MeasureResult {
        const horizontal = this.start + this.end
        const vertical = this.top + this.bottom

        const placeable = measurable.measure(constraints.offset(-horizontal, -vertical))

        const width = constraints.constrainWidth(placeable.width + horizontal)
        const height = constraints.constrainHeight(placeable.height + vertical)
        return MeasureResult(width, height, () => {
            placeable.place(this.start, this.top)
        })
    }

    equals(other: ModifierElement): boolean {
        return other instanceof PaddingModifierImpl
            && this.start === other.start
            && this.top === other.top
            && this.end === other.end
            && this.bottom === other.bottom
    }
}
