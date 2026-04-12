import {Layout} from "../runtime/layout/Layout.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {EmptyMeasurePolicy} from "./Empty";


export function Spacer(modifier: Modifier = new Modifier()) {
    Layout(() => {}, EmptyMeasurePolicy, modifier)
}
