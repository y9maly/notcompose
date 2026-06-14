import {Spacer} from "../../notcompose-layout/highlevel/Spacer";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {BackgroundModifier} from "../../notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {FillMaxWidthModifier} from "../../notcompose-layout/runtime/modifiers/FillModifier";
import {HeightModifier} from "../../notcompose-layout/runtime/modifiers/SizeModifier";
import {Color} from "../../notcompose-terminal/runtime/ui/Color";
import {elvis} from "../../notcompose/runtime-highlevel/elvis";

export function Divider(symbol: string = '-', params?: {
    color?: Color | null,
}) {
    const { color } = elvis(params, {
        color: null,
    })

    Spacer(new Modifier([
        BackgroundModifier(symbol, { color }),
        FillMaxWidthModifier(),
        HeightModifier(1),
    ]))
}
