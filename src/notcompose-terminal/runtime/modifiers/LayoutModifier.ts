import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {Constraints} from "../layout/Constraints";
import {Placeable} from "../layout/Placeable";
import {IntrinsicMeasurable} from "../layout/IntrinsicMeasurable";
import {Measurable, MeasureResult} from "../layout/Measurable";


export interface LayoutModifier extends ModifierElement {
    measure(measurable: Measurable, constraints: Constraints): MeasureResult

    minIntrinsicWidth(measurable: IntrinsicMeasurable, height: number | null): number
    maxIntrinsicWidth(measurable: IntrinsicMeasurable, height: number | null): number
    minIntrinsicHeight(measurable: IntrinsicMeasurable, width: number | null): number
    maxIntrinsicHeight(measurable: IntrinsicMeasurable, width: number | null): number
}

const symbol = Symbol()
LayoutModifier.symbol = symbol
LayoutModifier.of = (o: unknown): LayoutModifier | null => {
    if (!o || typeof o !== 'object' || !(LayoutModifier.symbol in o)) return null
    return o[LayoutModifier.symbol] as LayoutModifier
}

export function LayoutModifier(
    measure: (measurable: Measurable, constraints: Constraints) => MeasureResult,
    minIntrinsicWidth?: (measurable: IntrinsicMeasurable, height: number | null) => number,
    maxIntrinsicWidth?: (measurable: IntrinsicMeasurable, height: number | null) => number,
    minIntrinsicHeight?: (measurable: IntrinsicMeasurable, width: number | null) => number,
    maxIntrinsicHeight?: (measurable: IntrinsicMeasurable, width: number | null) => number,
): LayoutModifier {
    return new LayoutModifierImpl(measure, minIntrinsicWidth, maxIntrinsicWidth, minIntrinsicHeight, maxIntrinsicHeight)
}

class LayoutModifierImpl implements LayoutModifier {
    [LayoutModifier.symbol] = this;

    measure: (measurable: Measurable, constraints: Constraints) => MeasureResult
    minIntrinsicWidth: (measurable: IntrinsicMeasurable, height: number | null) => number
    maxIntrinsicWidth: (measurable: IntrinsicMeasurable, height: number | null) => number
    minIntrinsicHeight: (measurable: IntrinsicMeasurable, width: number | null) => number
    maxIntrinsicHeight: (measurable: IntrinsicMeasurable, width: number | null) => number

    constructor(
        measure: (measurable: Measurable, constraints: Constraints) => MeasureResult,
        minIntrinsicWidth?: (measurable: IntrinsicMeasurable, height: number | null) => number,
        maxIntrinsicWidth?: (measurable: IntrinsicMeasurable, height: number | null) => number,
        minIntrinsicHeight?: (measurable: IntrinsicMeasurable, width: number | null) => number,
        maxIntrinsicHeight?: (measurable: IntrinsicMeasurable, width: number | null) => number,
    ) {
        this.measure = measure
        this.minIntrinsicWidth = minIntrinsicWidth ?? minIntrinsicWidthImpl.bind(this)
        this.maxIntrinsicWidth = maxIntrinsicWidth ?? maxIntrinsicWidthImpl.bind(this)
        this.minIntrinsicHeight = minIntrinsicHeight ?? minIntrinsicHeightImpl.bind(this)
        this.maxIntrinsicHeight = maxIntrinsicHeight ?? maxIntrinsicHeightImpl.bind(this)
    }

    equals(other: ModifierElement): boolean {
        return other instanceof LayoutModifierImpl && other.measure === this.measure
    }
}

function minIntrinsicWidthImpl(this: LayoutModifier, measurable: IntrinsicMeasurable, height: number | null): number {
    const intrinsicMeasurable = new DefaultIntrinsicMeasurable(
        measurable,
        IntrinsicMinMax.Min,
        IntrinsicWidthHeight.Width,
    )
    const constraints = new Constraints({ maxHeight: height })
    const layoutResult = this.measure(intrinsicMeasurable, constraints)
    return layoutResult.width
}

function maxIntrinsicWidthImpl(this: LayoutModifier, measurable: IntrinsicMeasurable, height: number | null): number {
    const intrinsicMeasurable = new DefaultIntrinsicMeasurable(
        measurable,
        IntrinsicMinMax.Max,
        IntrinsicWidthHeight.Width,
    )
    const constraints = new Constraints({ maxHeight: height })
    const layoutResult = this.measure(intrinsicMeasurable, constraints)
    return layoutResult.width
}

function minIntrinsicHeightImpl(this: LayoutModifier, measurable: IntrinsicMeasurable, width: number | null): number {
    const intrinsicMeasurable = new DefaultIntrinsicMeasurable(
        measurable,
        IntrinsicMinMax.Min,
        IntrinsicWidthHeight.Height,
    )
    const constraints = new Constraints({ maxWidth: width })
    const layoutResult = this.measure(intrinsicMeasurable, constraints)
    return layoutResult.height
}

function maxIntrinsicHeightImpl(this: LayoutModifier, measurable: IntrinsicMeasurable, width: number | null): number {
    const intrinsicMeasurable = new DefaultIntrinsicMeasurable(
        measurable,
        IntrinsicMinMax.Max,
        IntrinsicWidthHeight.Height,
    )
    const constraints = new Constraints({ maxWidth: width })
    const layoutResult = this.measure(intrinsicMeasurable, constraints)
    return layoutResult.height
}

enum IntrinsicMinMax { Min, Max }
enum IntrinsicWidthHeight { Width, Height }

class DefaultIntrinsicMeasurable implements Measurable {
    constructor(
        private _measurable: IntrinsicMeasurable,
        private _minMax: IntrinsicMinMax,
        private _widthHeight: IntrinsicWidthHeight,
    ) {}

    measure(constraints: Constraints): Placeable {
        if (this._widthHeight === IntrinsicWidthHeight.Width) {
            const width = this._minMax === IntrinsicMinMax.Max
                ? this._measurable.maxIntrinsicWidth(constraints.maxHeight)
                : this._measurable.minIntrinsicWidth(constraints.maxHeight)
            const height = constraints.maxHeight ?? 1000000
            return new EmptyPlaceable(width, height)
        } else {
            const height = this._minMax === IntrinsicMinMax.Max
                ? this._measurable.maxIntrinsicHeight(constraints.maxWidth)
                : this._measurable.minIntrinsicHeight(constraints.maxWidth)
            const width = constraints.maxWidth ?? 1000000
            return new EmptyPlaceable(width, height)
        }
    }

    minIntrinsicWidth(height: number | null): number {
        return this._measurable.minIntrinsicWidth(height)
    }

    maxIntrinsicWidth(height: number | null): number {
        return this._measurable.maxIntrinsicWidth(height)
    }

    minIntrinsicHeight(width: number | null): number {
        return this._measurable.minIntrinsicHeight(width)
    }

    maxIntrinsicHeight(width: number | null): number {
        return this._measurable.maxIntrinsicHeight(width)
    }
}

class EmptyPlaceable implements Placeable {
    constructor(
        public width: number,
        public height: number
    ) {}

    place(x: number, y: number): void {}
}
