import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {LayoutModifier} from "./LayoutModifier";
import {TextCanvas} from "../ui/graphics/TextCanvas";
import {elvis} from "../../../notcompose/runtime-highlevel/elvis";
import {Constraints} from "../layout/Constraints";
import {Measurable, MeasureResult} from "../layout/Measurable";
import {DrawModifier} from "./DrawModifier";
import {ContentDrawScope} from "../ui/graphics/ContentDrawScope";
import {Color} from "../ui/Color";
import {AnnotatedString} from "../ui/AnnotatedString";
import {ColorTextSpan, TextSpan} from "../ui/TextSpan";


export function BorderModifier(params?: {
    color?: Color | null,
    topStart?: string,
    topEnd?: string,
    bottomStart?: string,
    bottomEnd?: string,
    verticalStart?: string,
    verticalEnd?: string,
    horizontalTop?: string,
    horizontalBottom?: string,
}): ModifierElement {
    const { color, topStart, topEnd, bottomStart, bottomEnd, verticalStart, verticalEnd, horizontalTop, horizontalBottom } = elvis(params, {
        color: null,
        topStart: '┌',
        topEnd: '┐',
        bottomStart: '└',
        bottomEnd: '┘',
        verticalStart: '│',
        verticalEnd: '│',
        horizontalTop: '─',
        horizontalBottom: '─',
    })

    return new BorderModifierImpl(color, topStart, topEnd, bottomStart, bottomEnd, verticalStart, verticalEnd, horizontalTop, horizontalBottom)
}


class BorderModifierImpl implements DrawModifier {
    [DrawModifier.symbol] = this;

    constructor(
        private color: Color | null,
        private topStart: string,
        private topEnd: string,
        private bottomStart: string,
        private bottomEnd: string,
        private verticalStart: string,
        private verticalEnd: string,
        private horizontalTop: string,
        private horizontalBottom: string,
    ) {}

    [LayoutModifier.symbol] = LayoutModifier((measurable, constraints) => {
        const placeable = measurable.measure(
            constraints.minusMaxWidth(2).minusMaxHeight(2)
        )

        const width = placeable.width + 2
        const height = placeable.height + 2
        return MeasureResult(width, height, () => {
            placeable.place(1, 1)
        })
    });

    draw(scope: ContentDrawScope) {
        scope.drawText(0, 0, this.colored(this.topStart))
        scope.drawText(scope.availableWidth-1, 0, this.colored(this.topEnd))
        scope.drawText(scope.availableWidth-1, scope.availableHeight-1, this.colored(this.bottomEnd))
        scope.drawText(0, scope.availableHeight-1, this.colored(this.bottomStart))

        for (let y = 1; y < scope.availableHeight-1; y++) {
            scope.drawText(0, y, this.colored(this.verticalStart))
        }

        for (let y = 1; y < scope.availableHeight-1; y++) {
            scope.drawText(scope.availableWidth-1, y, this.colored(this.verticalEnd))
        }

        for (let x = 1; x < scope.availableWidth-1; x++) {
            scope.drawText(x, 0, this.colored(this.horizontalTop))
        }

        for (let x = 1; x < scope.availableWidth-1; x++) {
            scope.drawText(x, scope.availableHeight-1, this.colored(this.horizontalBottom))
        }

        scope.drawContent()
    }

    private colored(string: string): string | AnnotatedString {
        if (this.color === null)
            return string
        return new AnnotatedString(string, [new TextSpan(new ColorTextSpan(this.color), 0, string.length)])
    }

    equals(other: ModifierElement): boolean {
        return other instanceof BorderModifierImpl
            && this.color === other.color
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
