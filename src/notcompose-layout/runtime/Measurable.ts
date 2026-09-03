import type { IntrinsicMeasurable } from './IntrinsicMeasurable.js'
import { Constraints } from './Constraints.js'
import type { Placeable } from './Placeable.js'

export interface Measurable extends IntrinsicMeasurable {
    measure(constraints: Constraints): Placeable
}

export interface MeasureResult {
    width: number
    height: number

    placeChildren(): void
}

export function MeasureResult(
    width: number,
    height: number,
    placeChildren: () => void = () => {},
): MeasureResult { return { width, height, placeChildren } }
