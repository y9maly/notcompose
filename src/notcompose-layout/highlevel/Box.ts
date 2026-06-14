import {Layout} from "../runtime/Layout.js";
import {elvis, Modifier, NameElement} from "notcompose";
import {Alignment} from "../runtime/core/Alignment.js";
import {Size} from "../runtime/core/Size.js";
import {Placeable} from "../runtime/Placeable.js";
import {MeasureResult} from "../runtime/Measurable.js";
import {MeasurePolicy} from "../runtime/MeasurePolicy.js";

export const BoxMeasurePolicy = (
    alignment: Alignment = Alignment.TopStart,
    propagateMinConstraints: boolean = false,
) => MeasurePolicy((measurables, constraints) => {
    let totalWidth = 0
    let totalHeight = 0

    const placeables: Placeable[] = []
    const childConstraints = propagateMinConstraints ? constraints : constraints.copyMaxDimensions()
    measurables.forEach(measurable => {
        const placeable = measurable.measure(childConstraints)
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

    Layout(content, BoxMeasurePolicy(alignment), modifier.then(new NameElement('Box')))
}
