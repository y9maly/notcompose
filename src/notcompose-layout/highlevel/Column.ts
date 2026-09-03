import { Layout } from '../runtime/Layout.js'
import { elvis, Modifier, NameModifier } from 'notcompose'
import { Alignment, HorizontalAlignment } from '../runtime/core/Alignment.js'
import type { Placeable } from '../runtime/Placeable.js'
import { MeasurePolicy } from '../runtime/MeasurePolicy.js'

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

export function Column(content: () => void, modifier: Modifier = Modifier, params?: {
    horizontalAlignment?: HorizontalAlignment
}) {
    const { horizontalAlignment } = elvis(params, {
        horizontalAlignment: Alignment.Start
    })

    Layout(content, ColumnMeasurePolicy(horizontalAlignment), modifier.then(NameModifier('Column')))
}
