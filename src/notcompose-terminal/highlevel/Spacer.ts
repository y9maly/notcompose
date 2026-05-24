import {Layout} from "../runtime/layout/Layout.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {EmptyMeasurePolicy} from "./Empty";
import {NameElement} from "../../notcompose/runtime/modifiers/NameElement";

export function Spacer(modifier: Modifier = new Modifier()) {
    Layout(() => {}, EmptyMeasurePolicy, modifier.then(new NameElement('Spacer')))
}
