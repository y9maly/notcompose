import {Measurable, MeasureResult} from "./Measurable";
import {Constraints} from "./Constraints";
import {IntrinsicMeasurable} from "./IntrinsicMeasurable";
import {Placeable} from "./Placeable";

export interface MeasurePolicy {
    measure(measurables: ReadonlyArray<Measurable>, constraints: Constraints): MeasureResult

    minIntrinsicWidth(measurables: ReadonlyArray<Measurable>, height: number | null): number
    maxIntrinsicWidth(measurables: ReadonlyArray<Measurable>, height: number | null): number
    minIntrinsicHeight(measurables: ReadonlyArray<Measurable>, width: number | null): number
    maxIntrinsicHeight(measurables: ReadonlyArray<Measurable>, width: number | null): number
}

export function MeasurePolicy(
    measure: (measurables: ReadonlyArray<Measurable>, constraints: Constraints) => MeasureResult,
    minIntrinsicWidth?: (measurables: ReadonlyArray<Measurable>, height: number | null) => number,
    maxIntrinsicWidth?: (measurables: ReadonlyArray<Measurable>, height: number | null) => number,
    minIntrinsicHeight?: (measurables: ReadonlyArray<Measurable>, width: number | null) => number,
    maxIntrinsicHeight?: (measurables: ReadonlyArray<Measurable>, width: number | null) => number,
): MeasurePolicy {
    return new MeasurePolicyImpl(measure, minIntrinsicWidth, maxIntrinsicWidth, minIntrinsicHeight, maxIntrinsicHeight)
}

class MeasurePolicyImpl implements MeasurePolicy {
    measure: (measurables: ReadonlyArray<Measurable>, constraints: Constraints) => MeasureResult

    minIntrinsicWidth: (measurables: ReadonlyArray<Measurable>, height: number | null) => number
    maxIntrinsicWidth: (measurables: ReadonlyArray<Measurable>, height: number | null) => number
    minIntrinsicHeight: (measurables: ReadonlyArray<Measurable>, width: number | null) => number
    maxIntrinsicHeight: (measurables: ReadonlyArray<Measurable>, width: number | null) => number

    constructor(
        measure: (measurables: ReadonlyArray<Measurable>, constraints: Constraints) => MeasureResult,
        minIntrinsicWidth?: (measurables: ReadonlyArray<Measurable>, height: number | null) => number,
        maxIntrinsicWidth?: (measurables: ReadonlyArray<Measurable>, height: number | null) => number,
        minIntrinsicHeight?: (measurables: ReadonlyArray<Measurable>, width: number | null) => number,
        maxIntrinsicHeight?: (measurables: ReadonlyArray<Measurable>, width: number | null) => number,
    ) {
        this.measure = measure
        this.minIntrinsicWidth = minIntrinsicWidth ?? minIntrinsicWidthImpl.bind(this)
        this.maxIntrinsicWidth = maxIntrinsicWidth ?? maxIntrinsicWidthImpl.bind(this)
        this.minIntrinsicHeight = minIntrinsicHeight ?? minIntrinsicHeightImpl.bind(this)
        this.maxIntrinsicHeight = maxIntrinsicHeight ?? maxIntrinsicHeightImpl.bind(this)
    }
}

function minIntrinsicWidthImpl(this: MeasurePolicyImpl, measurables: ReadonlyArray<Measurable>, height: number | null) {
    const mapped = measurables.map(it =>
        new DefaultIntrinsicMeasurable(it, IntrinsicMinMax.Min, IntrinsicWidthHeight.Width)
    )
    const constraints = new Constraints({ maxHeight: height })
    const layoutResult = this.measure(mapped, constraints)
    return layoutResult.width
}

function maxIntrinsicWidthImpl(this: MeasurePolicyImpl, measurables: ReadonlyArray<Measurable>, height: number | null) {
    const mapped = measurables.map(it =>
        new DefaultIntrinsicMeasurable(it, IntrinsicMinMax.Max, IntrinsicWidthHeight.Width)
    )
    const constraints = new Constraints({ maxHeight: height })
    const layoutResult = this.measure(mapped, constraints)
    return layoutResult.width
}

function minIntrinsicHeightImpl(this: MeasurePolicyImpl, measurables: ReadonlyArray<Measurable>, width: number | null) {
    const mapped = measurables.map(it =>
        new DefaultIntrinsicMeasurable(it, IntrinsicMinMax.Min, IntrinsicWidthHeight.Height)
    )
    const constraints = new Constraints({ maxWidth: width })
    const layoutResult = this.measure(mapped, constraints)
    return layoutResult.height
}

function maxIntrinsicHeightImpl(this: MeasurePolicyImpl, measurables: ReadonlyArray<Measurable>, width: number | null) {
    const mapped = measurables.map(it =>
        new DefaultIntrinsicMeasurable(it, IntrinsicMinMax.Max, IntrinsicWidthHeight.Height)
    )
    const constraints = new Constraints({ maxWidth: width })
    const layoutResult = this.measure(mapped, constraints)
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

