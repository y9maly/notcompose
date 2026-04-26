import {IntrinsicMeasurable} from "./IntrinsicMeasurable";
import {Constraints} from "./Constraints";
import {Placeable} from "./Placeable";


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
