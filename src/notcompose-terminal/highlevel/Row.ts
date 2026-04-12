import {Layout} from "../runtime/layout/Layout.js";
import {MeasurePolicy, Placeable} from "../runtime/layout/measure.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {Alignment, VerticalAlignment} from "../runtime/ui/Alignment";
import {elvis} from "../../notcompose/runtime-highlevel/elvis";


export const RowMeasurePolicy = (
    verticalAlignment: VerticalAlignment = Alignment.Top
) => MeasurePolicy((measurables, constraints) => {
    let totalWidth = 0
    let totalHeight = 0

    const placeables: Placeable[] = []
    let currentConstraints = constraints.copyMaxDimensions()
    measurables.forEach(measurable => {
        let x = false
        const placeable = measurable.measure(currentConstraints)
        placeables.push(placeable)
        if (x) {
            measurable.measure(currentConstraints)
        }
        const { width, height } = placeable
        currentConstraints = currentConstraints.minusMaxWidth(width)
        totalWidth += width
        totalHeight = Math.max(totalHeight, height)
    })

    totalWidth = constraints.constrainWidth(totalWidth)
    totalHeight = constraints.constrainHeight(totalHeight)
    return {
        width: totalWidth,
        height: totalHeight,
        placeChildren: () => {
            let x = 0
            placeables.forEach(placeable => {
                placeable.place(x, verticalAlignment(placeable.height, totalHeight))
                x += placeable.width
            })
        }
    }
})


export function Row(content: () => void, modifier: Modifier = new Modifier(), params?: {
    verticalAlignment?: VerticalAlignment,
}) {
    const { verticalAlignment } = elvis(params, {
        verticalAlignment: Alignment.Top
    })

    Layout(content, RowMeasurePolicy(verticalAlignment), modifier)
}
