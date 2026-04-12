import {TextModifier} from "../runtime/modifiers/TextModifier.js";
import {Layout} from "../runtime/layout/Layout.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {EmptyMeasurePolicy} from "./Empty";


export function Text(text: string, modifier: Modifier = new Modifier()) {
    Layout(() => {}, EmptyMeasurePolicy, modifier.then(TextModifier(text)))
}
