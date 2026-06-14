import {elvis, Modifier} from "notcompose";
import {Box, OffsetXModifier, Row} from "notcompose/layout";
import {BorderModifier, Color, colored, Text} from "notcompose/terminal";

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
    modifier: Modifier = new Modifier(),
    params?: {
        color?: Color | null,
    }
) {
    const { color } = elvis(params, {
        color: null,
    })

    Box(() => {
        Box(content, new Modifier([BorderModifier({ color: color })]))

        Row(() => {
            Text(colored(color, `┐`))
            title()
            Text(colored(color, `┌`))
        }, new Modifier([OffsetXModifier(1)]))
    }, modifier)
}
