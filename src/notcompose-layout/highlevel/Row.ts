import {Layout} from "../runtime/Layout.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {Alignment, VerticalAlignment} from "../runtime/core/Alignment";
import {elvis} from "../../notcompose/runtime-highlevel/elvis";
import {Placeable} from "../runtime/Placeable";
import {MeasurePolicy} from "../runtime/MeasurePolicy";
import {NameElement} from "../../notcompose/runtime/modifiers/NameElement";

export const RowMeasurePolicy = (
    verticalAlignment: VerticalAlignment = Alignment.Top
) => MeasurePolicy((measurables, constraints) => {
    let totalWidth = 0
    let totalHeight = 0

    const placeables: Placeable[] = []
    let currentConstraints = constraints.copyMaxDimensions()
    measurables.forEach(measurable => {
        const placeable = measurable.measure(currentConstraints)
        placeables.push(placeable)
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

    Layout(content, RowMeasurePolicy(verticalAlignment), modifier.then(new NameElement('Row')))
}
