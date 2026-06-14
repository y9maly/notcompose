import {TextModifier} from "../runtime/modifiers/TextModifier.js";
import {EmptyMeasurePolicy, Layout} from "notcompose/layout";
import {Modifier, NameElement} from "notcompose";
import {AnnotatedString} from "../runtime/ui/AnnotatedString.js";

export function Text(text: string | AnnotatedString, modifier: Modifier = new Modifier()) {
    Layout(() => {}, EmptyMeasurePolicy, modifier.then(TextModifier(text), new NameElement('Text')))
}
