import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {TextCanvas} from "../draw/TextCanvas";


export interface RawTextModifier extends ModifierElement {
    rawText(availableWidth: number, availableHeight: number, canvas: TextCanvas): void
}

const symbol = Symbol()
RawTextModifier.symbol = symbol
RawTextModifier.of = (o: unknown): RawTextModifier | null => {
    if (!o || typeof o !== 'object' || !(RawTextModifier.symbol in o)) return null
    return o[RawTextModifier.symbol] as RawTextModifier
}

export function RawTextModifier(rawText: string): RawTextModifier {
    return new RawTextModifierImpl(rawText)
}

class RawTextModifierImpl implements RawTextModifier {
    [RawTextModifier.symbol] = this;

    constructor(
        private _rawText: string
    ) {}

    rawText(availableWidth: number, availableHeight: number, canvas: TextCanvas) {
        canvas.drawText(0, 0, this._rawText)
    }

    equals(other: ModifierElement): boolean {
        return other instanceof RawTextModifierImpl && other._rawText === this._rawText
    }
}
