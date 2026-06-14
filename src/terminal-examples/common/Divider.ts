import {FillMaxWidthModifier, HeightModifier, Spacer} from "notcompose/layout";
import {BackgroundModifier, Color} from "notcompose/terminal";
import {elvis, Modifier} from "notcompose";

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
