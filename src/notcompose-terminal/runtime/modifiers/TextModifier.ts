import {LayoutModifier} from "./LayoutModifier.js";
import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {MeasureResult} from "../layout/Measurable";
import {annotated, AnnotatedString} from "../ui/AnnotatedString";
import {TextSpan} from "../ui/TextSpan";
import {DrawModifier} from "./DrawModifier";
import {ContentDrawScope} from "../ui/graphics/ContentDrawScope";

export function TextModifier(text: string | AnnotatedString): ModifierElement {
    return new TextModifierImpl(text)
}

class TextModifierImpl implements DrawModifier {
    [DrawModifier.symbol] = this;

    private requiredWidth = 0
    private requiredHeight = 1
    constructor(private text: string | AnnotatedString) {
        if (text !== '') {
            let lineWidth = 0
            for (const char of typeof text === 'string' ? text : text.string) {
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

    [LayoutModifier.symbol] = LayoutModifier((measurable, constraints) => {
        const placeable = measurable.measure(constraints)
        return MeasureResult(
            constraints.constrainWidth(this.requiredWidth),
            constraints.constrainHeight(this.requiredHeight),
            () => placeable.place(0, 0)
        )
    })

    draw(scope: ContentDrawScope) {
        scope.drawContent()
        scope.drawText(0, 0, this.buildText(scope.availableWidth, scope.availableHeight))
    }

    private buildText(availableWidth: number, availableHeight: number): AnnotatedString {
        const rawString = typeof this.text === 'string' ? this.text : this.text.string
        const spans = typeof this.text === 'string' ? [] : this.text.spans

        if (availableWidth === 0 || availableHeight === 0 || rawString === '')
            return annotated``

        if (availableWidth >= this.requiredWidth && availableHeight >= this.requiredHeight)
            return new AnnotatedString(rawString, spans)

        return this.cropAnnotatedString(rawString, spans, availableWidth, availableHeight)
    }

    private cropAnnotatedString(
        rawString: string,
        spans: ReadonlyArray<TextSpan>,
        maxWidth: number,
        maxHeight: number
    ): AnnotatedString {
        let newString = []

        const oldToNewMap = new Array(rawString.length).fill(-1)

        let cx = 0
        let cy = 0
        for (let i = 0; i < rawString.length; i++) {
            const ch = rawString[i]

            if (cy >= maxHeight)
                break

            if (ch === '\n') {
                newString.push(ch)
                oldToNewMap[i] = newString.length - 1
                cy++
                cx = 0
                continue
            }

            if (cx < maxWidth) {
                newString.push(ch)
                oldToNewMap[i] = newString.length - 1
            }

            cx++
        }

        const newSpans: TextSpan[] = []
        for (const span of spans) {
            let newStart = -1
            let newEnd = -1

            for (let i = span.start; i < span.end; i++) {
                if (i >= oldToNewMap.length)
                    break

                const mappedIndex = oldToNewMap[i]
                if (mappedIndex !== -1) {
                    if (newStart === -1) newStart = mappedIndex
                    newEnd = mappedIndex
                }
            }

            if (newStart !== -1) {
                newSpans.push(new TextSpan(
                    span.type,
                    newStart,
                    (newEnd - newStart) + 1,
                ))
            }
        }

        return new AnnotatedString(newString.join(''), newSpans)
    }

    equals(other: ModifierElement): boolean {
        if (!(other instanceof TextModifierImpl))
            return false
        if (this.text instanceof AnnotatedString)
            return false // todo no equals in AnnotatedString
        return this.text === other.text
    }
}
