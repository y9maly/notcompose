import {Layout} from "../runtime/layout/Layout.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {Alignment} from "../runtime/ui/Alignment";
import {Size} from "../runtime/ui/Size";
import {elvis} from "../../notcompose/runtime-highlevel/elvis";
import {Placeable} from "../runtime/layout/Placeable";
import {MeasureResult} from "../runtime/layout/Measurable";
import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";


export const BoxMeasurePolicy = (
    alignment: Alignment = Alignment.TopStart,
) => MeasurePolicy((measurables, constraints) => {
    let totalWidth = 0
    let totalHeight = 0

    const placeables: Placeable[] = []
    measurables.forEach(measurable => {
        const placeable = measurable.measure(constraints)
        placeables.push(placeable)
        totalWidth = Math.max(totalWidth, placeable.width)
        totalHeight = Math.max(totalHeight, placeable.height)
    })

    totalWidth = constraints.constrainWidth(totalWidth)
    totalHeight = constraints.constrainHeight(totalHeight)
    const space = new Size(totalWidth, totalHeight)
    return MeasureResult(totalWidth, totalHeight, () => {
        placeables.forEach(placeable => {
            const offset = alignment(new Size(placeable.width, placeable.height), space)
            placeable.place(offset.x, offset.y)
        })
    })
})

export function Box(content: () => void, modifier: Modifier = new Modifier(), params?: {
    alignment?: Alignment,
}) {
    const { alignment } = elvis(params, {
        alignment: Alignment.TopStart
    })

    Layout(content, BoxMeasurePolicy(alignment), modifier)
}
