import {MeasurePolicy, MeasureResult} from "../runtime/layout/measure";


export const EmptyMeasurePolicy: MeasurePolicy = {
    measure(measurables, constraints): MeasureResult {
        return MeasureResult(constraints.minWidth, constraints.minHeight)
    }
}
