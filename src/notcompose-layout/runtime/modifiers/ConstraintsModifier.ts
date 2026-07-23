import { LayoutModifier } from './LayoutModifier.js'
import { MeasureResult } from '../Measurable.js'

export const ConstraintsModifiers = {
    minusMaxWidth: (value: number) => LayoutModifier((measurable, constraints) => {
        const placeable = measurable.measure(constraints.minusMaxWidth(value))
        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(0, 0)
        })
    }),

    minusMaxHeight: (value: number) => LayoutModifier((measurable, constraints) => {
        const placeable = measurable.measure(constraints.minusMaxHeight(value))
        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(0, 0)
        })
    })
}
