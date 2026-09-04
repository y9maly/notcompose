import { elvis } from '@notcompose/core'
import { Box, Row } from '@notcompose/layout'
import { Color, colored, Modifier, Text } from '@notcompose/terminal'

/**
 * ```
 * ┌┐ Title ┌───┐
 * │Some content│
 * └────────────┘
 * ```
 */
export function BorderedTitledBox(
    title: () => void,
    content: () => void,
    modifier: Modifier = Modifier,
    params?: {
        color?: Color | null
    }
) {
    const { color } = elvis(params, {
        color: null,
    })

    Box(() => {
        Box(content, Modifier.border({ color: color }))

        Row(() => {
            Text(colored(color, `┐`))
            title()
            Text(colored(color, `┌`))
        }, Modifier.offsetX(1))
    }, modifier)
}
