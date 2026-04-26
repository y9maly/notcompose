import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {LayoutModifier} from "./LayoutModifier";
import {Constraints} from "../layout/Constraints";
import {MeasureResult} from "../layout/Measurable";


/**
 * @param fraction 0 - 0%; 1 - 100%
 */
export function FillMaxSizeModifier(fraction: number = 1): ModifierElement {
    return new FillModifierImpl(fraction, fraction, true, true)
}

/**
 * @param fraction 0 - 0%; 1 - 100%
 */
export function FillMaxWidthModifier(fraction: number = 1): ModifierElement {
    return new FillModifierImpl(fraction, 0, true, false)
}

/**
 * @param fraction 0 - 0%; 1 - 100%
 */
export function FillMaxHeightModifier(fraction: number = 1): ModifierElement {
    return new FillModifierImpl(0, fraction, false, true)
}


class FillModifierImpl {
    constructor(
        private horizontalFraction: number,
        private verticalFraction: number,
        private horizontal: boolean,
        private vertical: boolean,
    ) {}

    [LayoutModifier.symbol] = LayoutModifier((measurable, constraints) => {
        let minWidth: number
        let maxWidth: number | null
        let minHeight: number
        let maxHeight: number | null

        if (this.horizontal && constraints.hasBoundedWidth) {
            minWidth = maxWidth = Math.round(constraints.maxWidth! * this.horizontalFraction)
        } else {
            minWidth = constraints.minWidth
            maxWidth = constraints.maxWidth
        }

        if (this.vertical && constraints.hasBoundedHeight) {
            minHeight = maxHeight = Math.round(constraints.maxHeight! * this.verticalFraction)
        } else {
            minHeight = constraints.minHeight
            maxHeight = constraints.maxHeight
        }

        const placeable = measurable.measure(new Constraints(minWidth, maxWidth, minHeight, maxHeight))

        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(0, 0)
        })
    });

    equals(other: ModifierElement): boolean {
        return other instanceof FillModifierImpl
            && this.horizontalFraction === other.horizontalFraction
            && this.verticalFraction === other.verticalFraction
            && this.horizontal === other.horizontal
            && this.vertical === other.vertical
    }
}
