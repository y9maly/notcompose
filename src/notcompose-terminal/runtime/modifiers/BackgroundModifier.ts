import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {DrawModifier} from "./DrawModifier";
import {ContentDrawScope} from "../ui/graphics/ContentDrawScope";
import {Color} from "../ui/Color";
import {elvis} from "../../../notcompose/runtime-highlevel/elvis";
import {ColorTextSpan, TextSpan} from "../ui/TextSpan";
import {AnnotatedString} from "../ui/AnnotatedString";


export function BackgroundModifier(
    symbol: string,
    params?: {
        color?: Color | null,
    }
): ModifierElement {
    const { color } = elvis(params, {
        color: null,
    })

    return new BackgroundModifierImpl(symbol, color)
}

class BackgroundModifierImpl implements DrawModifier {
    [DrawModifier.symbol] = this;

    constructor(private symbol: string, private color: Color | null) {}

    draw(scope: ContentDrawScope) {
        const spans = this.color !== null
            ? [new TextSpan(new ColorTextSpan(this.color), 0, 1)]
            : []

        for (let x = 0; x < scope.availableWidth; x++) {
            for (let y = 0; y < scope.availableHeight; y++) {
                scope.drawText(x, y, new AnnotatedString(this.symbol, spans))
            }
        }
    }

    equals(other: ModifierElement): boolean {
        return other instanceof BackgroundModifierImpl && other.symbol === this.symbol
    }
}
