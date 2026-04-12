import {RawTextModifier} from "./RawTextModifier.js";
import {LayoutModifier} from "./LayoutModifier.js";
import {Constraints, Measurable, MeasureResult} from "../layout/measure.js";
import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {TextCanvas} from "../draw/TextCanvas";


export function TextModifier(text: string): ModifierElement {
    return new TextModifierImpl(text)
}

class TextModifierImpl implements RawTextModifier, LayoutModifier {
    [RawTextModifier.symbol] = this;
    [LayoutModifier.symbol] = this;

    private requiredWidth = 0
    private requiredHeight = 1
    constructor(private text: string) {
        if (text !== '') {
            let lineWidth = 0
            for (const char of text) {
                if (char === '\n') {
                    this.requiredHeight++
                    this.requiredWidth = Math.max(lineWidth, this.requiredWidth)
                    lineWidth = 0
                } else {
                    lineWidth += char.length
                }
            }
            this.requiredWidth = Math.max(lineWidth, this.requiredWidth)
        }
    }

    measure(measurable: Measurable, constraints: Constraints): MeasureResult {
        const placeable = measurable.measure(constraints)
        return MeasureResult(
            constraints.constrainWidth(this.requiredWidth),
            constraints.constrainHeight(this.requiredHeight),
            () => placeable.place(0, 0)
        )
    }

    rawText(availableWidth: number, availableHeight: number, canvas: TextCanvas) {
        canvas.drawText(0, 0, this.buildText(availableWidth, availableHeight))
    }

    private buildText(availableWidth: number, availableHeight: number): string {
        if (availableWidth === 0 && availableHeight === 0)
            return ''
        if (availableWidth >= this.requiredWidth) {
            if (availableHeight >= this.requiredHeight) {
                return this.text
            } else {
                return this.text
                    .split('\n')
                    .slice(0, availableHeight)
                    .join('\n')
            }
        } else {
            if (availableHeight >= this.requiredHeight) {
                return this.text
                    .split('\n')
                    .map(it => it.substring(0, availableWidth))
                    .join('\n')
            } else {
                return this.text
                    .split('\n')
                    .slice(0, availableHeight)
                    .map(it => it.substring(0, availableWidth))
                    .join('\n')
            }
        }
    }

    equals(other: ModifierElement): boolean {
        return other instanceof TextModifierImpl && other.text === this.text
    }
}
