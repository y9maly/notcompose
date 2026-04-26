import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";
import {MeasureResult} from "../runtime/layout/Measurable";


export const EmptyMeasurePolicy = MeasurePolicy(
    (measurables, constraints) => {
        return MeasureResult(constraints.minWidth, constraints.minHeight)
    }
)
