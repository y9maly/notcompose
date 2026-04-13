import {RawTextModifier} from "./RawTextModifier";
import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {LayoutModifier} from "./LayoutModifier";
import {Constraints, Measurable, MeasureResult} from "../layout/measure";
import {TextCanvas} from "../draw/TextCanvas";
import {elvis} from "../../../notcompose/runtime-highlevel/elvis";


export function BorderModifier(symbols?: {
    topStart?: string,
    topEnd?: string,
    bottomStart?: string,
    bottomEnd?: string,
    verticalStart?: string,
    verticalEnd?: string,
    horizontalTop?: string,
    horizontalBottom?: string,
}): ModifierElement {
    const {topStart, topEnd, bottomStart, bottomEnd, verticalStart, verticalEnd, horizontalTop, horizontalBottom} = elvis(symbols, {
        topStart: '┌',
        topEnd: '┐',
        bottomStart: '└',
        bottomEnd: '┘',
        verticalStart: '│',
        verticalEnd: '│',
        horizontalTop: '─',
        horizontalBottom: '─',
    })

    return new BorderModifierImpl(topStart, topEnd, bottomStart, bottomEnd, verticalStart, verticalEnd, horizontalTop, horizontalBottom)
}


class BorderModifierImpl implements RawTextModifier, LayoutModifier {
    [RawTextModifier.symbol] = this;
    [LayoutModifier.symbol] = this;

    constructor(
        private topStart: string = '┌',
        private topEnd: string = '┐',
        private bottomStart: string = '└',
        private bottomEnd: string = '┘',
        private verticalStart: string = '│',
        private verticalEnd: string = '│',
        private horizontalTop: string = '─',
        private horizontalBottom: string = '─',
    ) {}

    measure(measurable: Measurable, constraints: Constraints): MeasureResult {
        const placeable = measurable.measure(
            constraints.minusMaxWidth(2).minusMaxHeight(2)
        )

        const width = placeable.width + 2
        const height = placeable.height + 2
        return MeasureResult(width, height, () => {
            placeable.place(1, 1)
        })
    }

    rawText(availableWidth: number, availableHeight: number, canvas: TextCanvas) {
        canvas.drawText(0, 0, this.topStart)
        canvas.drawText(availableWidth-1, 0, this.topEnd)
        canvas.drawText(availableWidth-1, availableHeight-1, this.bottomEnd)
        canvas.drawText(0, availableHeight-1, this.bottomStart)

        for (let y = 1; y < availableHeight-1; y++) {
            canvas.drawText(0, y, this.verticalStart)
        }

        for (let y = 1; y < availableHeight-1; y++) {
            canvas.drawText(availableWidth-1, y, this.verticalEnd)
        }

        for (let x = 1; x < availableWidth-1; x++) {
            canvas.drawText(x, 0, this.horizontalTop)
        }

        for (let x = 1; x < availableWidth-1; x++) {
            canvas.drawText(x, availableHeight-1, this.horizontalBottom)
        }
    }

    equals(other: ModifierElement): boolean {
        return other instanceof BorderModifierImpl
            && this.topStart === other.topStart
            && this.topEnd === other.topEnd
            && this.bottomStart === other.bottomStart
            && this.bottomEnd === other.bottomEnd
            && this.verticalStart === other.verticalStart
            && this.verticalEnd === other.verticalEnd
            && this.horizontalTop === other.horizontalTop
            && this.horizontalBottom === other.horizontalBottom
    }
}
