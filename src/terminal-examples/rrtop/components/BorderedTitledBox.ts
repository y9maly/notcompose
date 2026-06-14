import {Modifier} from "../../../notcompose/runtime/Modifier";
import {Box} from "../../../notcompose-layout/highlevel/Box";
import {BorderModifier} from "../../../notcompose-terminal/runtime/modifiers/BorderModifier";
import {Text} from "../../../notcompose-terminal/highlevel/Text";
import {OffsetXModifier} from "../../../notcompose-layout/runtime/modifiers/OffsetModifier";
import {Color} from "../../../notcompose-terminal/runtime/ui/Color";
import {elvis} from "../../../notcompose/runtime-highlevel/elvis";
import {Row} from "../../../notcompose-layout/highlevel/Row";
import {colored} from "../../../notcompose-terminal/runtime/ui/AnnotatedString";

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
