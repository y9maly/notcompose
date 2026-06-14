import {MeasurePolicy} from "../runtime/MeasurePolicy.js";
import {MeasureResult} from "../runtime/Measurable.js";

export const EmptyMeasurePolicy = MeasurePolicy(
    (measurables, constraints) => {
        return MeasureResult(constraints.minWidth, constraints.minHeight)
    }
)
