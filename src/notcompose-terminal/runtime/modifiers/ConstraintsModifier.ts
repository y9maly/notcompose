import {LayoutModifier} from "./LayoutModifier";
import {MeasureResult} from "../layout/measure";


export const ConstraintsModifiers = {
    MinusMaxWidth: (value: number) => LayoutModifier((measurable, constraints) => {
        const placeable = measurable.measure(constraints.minusMaxWidth(value))
        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(0, 0)
        })/**/
    }),

    MinusMaxHeight: (value: number) => LayoutModifier((measurable, constraints) => {
        const placeable = measurable.measure(constraints.minusMaxHeight(value))
        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(0, 0)
        })
    })
}
