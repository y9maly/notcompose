import {MeasurePolicy} from "../runtime/MeasurePolicy";
import {MeasureResult} from "../runtime/Measurable";

export const EmptyMeasurePolicy = MeasurePolicy(
    (measurables, constraints) => {
        return MeasureResult(constraints.minWidth, constraints.minHeight)
    }
)
