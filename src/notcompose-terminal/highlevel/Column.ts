import {Layout} from "../runtime/layout/Layout.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {elvis} from "../../notcompose/runtime-highlevel/elvis";
import {Alignment, HorizontalAlignment} from "../runtime/ui/Alignment";
import {Placeable} from "../runtime/layout/Placeable";
import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";


export const ColumnMeasurePolicy = (
    horizontalAlignment: HorizontalAlignment = Alignment.Start
) => MeasurePolicy((measurables, constraints) => {
    let totalWidth = 0
    let totalHeight = 0

    const placeables: Placeable[] = []
    let currentConstraints = constraints.copyMaxDimensions()
    measurables.forEach(measurable => {
        const placeable = measurable.measure(currentConstraints)
        placeables.push(placeable)
        const { width, height } = placeable
        currentConstraints = currentConstraints.minusMaxHeight(height)
        totalHeight += height
        totalWidth = Math.max(totalWidth, width)
    })

    totalWidth = constraints.constrainWidth(totalWidth)
    totalHeight = constraints.constrainHeight(totalHeight)
    return {
        width: totalWidth,
        height: totalHeight,
        placeChildren: () => {
            let y = 0
            placeables.forEach(placeable => {
                placeable.place(horizontalAlignment(placeable.width, totalWidth), y)
                y += placeable.height
            })
        }
    }
})

export function Column(content: () => void, modifier: Modifier = new Modifier(), params?: {
    horizontalAlignment?: HorizontalAlignment,
}) {
    const { horizontalAlignment } = elvis(params, {
        horizontalAlignment: Alignment.Start
    })

    Layout(content, ColumnMeasurePolicy(horizontalAlignment), modifier)
}
