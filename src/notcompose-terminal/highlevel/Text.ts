import {TextModifier} from "../runtime/modifiers/TextModifier.js";
import {Layout} from "../runtime/layout/Layout.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {EmptyMeasurePolicy} from "./Empty";
import {AnnotatedString} from "../runtime/ui/AnnotatedString";
import {NameElement} from "../../notcompose/runtime/modifiers/NameElement";


export function Text(text: string | AnnotatedString, modifier: Modifier = new Modifier()) {
    Layout(() => {}, EmptyMeasurePolicy, modifier.then(TextModifier(text), new NameElement('Text')))
}
