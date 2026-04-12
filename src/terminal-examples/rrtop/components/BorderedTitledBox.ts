import {Modifier} from "../../../notcompose/runtime/Modifier";
import {Box} from "../../../notcompose-terminal/highlevel/Box";
import {BorderModifier} from "../../../notcompose-terminal/runtime/modifiers/BorderModifier";
import {Text} from "../../../notcompose-terminal/highlevel/Text";
import {OffsetXModifier} from "../../../notcompose-terminal/runtime/modifiers/OffsetModifier";


/**
 * ```
 * ┌┐ Title ┌───┐
 * │Some content│
 * └────────────┘
 * ```
 */
export function BorderedTitledBox(
    title: string,
    content: () => void,
    modifier: Modifier = new Modifier(),
) {
    Box(() => {
        Box(content, new Modifier([BorderModifier()]))

        Text(`┐ ${title} ┌`, new Modifier([OffsetXModifier(1)]))
    }, modifier)
}
