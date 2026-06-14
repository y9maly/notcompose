import {Layout} from "../runtime/Layout.js";
import {Modifier, NameElement} from "notcompose";
import {EmptyMeasurePolicy} from "./Empty.js";

export function Spacer(modifier: Modifier = new Modifier()) {
    Layout(() => {}, EmptyMeasurePolicy, modifier.then(new NameElement('Spacer')))
}
