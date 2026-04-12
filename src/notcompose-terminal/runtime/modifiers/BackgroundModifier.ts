import {RawTextModifier} from "./RawTextModifier.js";
import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {TextCanvas} from "../draw/TextCanvas";


export function BackgroundModifier(symbol: string): ModifierElement {
    return new BackgroundModifierImpl(symbol)
}

class BackgroundModifierImpl implements RawTextModifier {
    [RawTextModifier.symbol] = this;

    constructor(private symbol: string) {}

    rawText(availableWidth: number, availableHeight: number, canvas: TextCanvas): void {
        for (let x = 0; x < availableWidth; x++) {
            for (let y = 0; y < availableHeight; y++) {
                canvas.drawText(x, y, this.symbol)
            }
        }
    }

    equals(other: ModifierElement): boolean {
        return other instanceof BackgroundModifierImpl && other.symbol === this.symbol
    }
}
