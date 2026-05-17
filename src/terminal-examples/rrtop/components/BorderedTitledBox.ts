import {Modifier} from "../../../notcompose/runtime/Modifier";
import {Box} from "../../../notcompose-terminal/highlevel/Box";
import {BorderModifier} from "../../../notcompose-terminal/runtime/modifiers/BorderModifier";
import {Text} from "../../../notcompose-terminal/highlevel/Text";
import {OffsetXModifier} from "../../../notcompose-terminal/runtime/modifiers/OffsetModifier";
import {Color} from "../../../notcompose-terminal/runtime/ui/Color";
import {elvis} from "../../../notcompose/runtime-highlevel/elvis";
import {Row} from "../../../notcompose-terminal/highlevel/Row";
import {AnnotatedString} from "../../../notcompose-terminal/runtime/ui/AnnotatedString";
import {ColorTextSpan, TextSpan} from "../../../notcompose-terminal/runtime/ui/TextSpan";


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
            Text(new AnnotatedString(`┐`, [new TextSpan(new ColorTextSpan(color), 0, 1)]))
            title()
            Text(new AnnotatedString(`┌`, [new TextSpan(new ColorTextSpan(color), 0, 1)]))
        }, new Modifier([OffsetXModifier(1)]))
    }, modifier)
}
