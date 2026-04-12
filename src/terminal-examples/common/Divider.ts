import {Spacer} from "../../notcompose-terminal/highlevel/Spacer";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {BackgroundModifier} from "../../notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {FillMaxWidthModifier} from "../../notcompose-terminal/runtime/modifiers/FillModifier";
import {HeightModifier} from "../../notcompose-terminal/runtime/modifiers/SizeModifier";


export function Divider(symbol: string = '-') {
    Spacer(new Modifier([
        BackgroundModifier(symbol),
        FillMaxWidthModifier(),
        HeightModifier(1),
    ]))
}
