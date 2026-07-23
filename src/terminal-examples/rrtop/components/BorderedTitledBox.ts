import {elvis, Modifier} from 'notcompose'
import {Box, offsetX, Row} from 'notcompose/layout'
import {border, Color, colored, Text} from 'notcompose/terminal'

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
        Box(content, Modifier.then(border({color: color})))

        Row(() => {
            Text(colored(color, `┐`))
            title()
            Text(colored(color, `┌`))
        }, Modifier.then(offsetX(1)))
    }, modifier)
}
