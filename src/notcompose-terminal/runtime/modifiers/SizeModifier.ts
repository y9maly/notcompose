import {ModifierElement} from "../../../notcompose/runtime/Modifier";
import {LayoutModifier} from "./LayoutModifier";
import {Constraints} from "../layout/Constraints";
import {MeasureResult} from "../layout/Measurable";


// Fixed size


export function SizeModifier(all: number): ModifierElement
export function SizeModifier(width: number, height: number): ModifierElement
export function SizeModifier(a: number, b?: number): ModifierElement {
    if (b === undefined)
        return new SizeModifierImpl(a, a, a, a, true)
    return new SizeModifierImpl(a, a, b, b, true)
}

export function WidthModifier(width: number): ModifierElement {
    return WidthInModifier(width, width)
}

export function HeightModifier(height: number): ModifierElement {
    return HeightInModifier(height, height)
}


// Size in


export function SizeInModifier(values: {
    minWidth?: number,
    maxWidth?: number | null,
    minHeight?: number,
    maxHeight?: number | null,
}): ModifierElement {
    return new SizeModifierImpl(values.minWidth, values.maxWidth, values.minHeight, values.maxHeight, true)
}

export function WidthInModifier(minWidth: number, maxWidth: number): ModifierElement {
    return new SizeModifierImpl(minWidth, maxWidth, undefined, undefined, true)
}

export function MinWidthModifier(minWidth: number): ModifierElement {
    return new SizeModifierImpl(minWidth, undefined, undefined, undefined, true)
}

export function MaxWidthModifier(maxWidth: number): ModifierElement {
    return new SizeModifierImpl(undefined, maxWidth, undefined, undefined, true)
}

export function HeightInModifier(minHeight: number, maxHeight: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, minHeight, maxHeight, true)
}

export function MinHeightModifier(minHeight: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, minHeight, undefined, true)
}

export function MaxHeightModifier(maxHeight: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, undefined, maxHeight, true)
}


// Required size


export function RequiredSizeModifier(all: number): ModifierElement {
    return new SizeModifierImpl(all, all, all, all, false)
}

export function RequiredWidthModifier(width: number): ModifierElement {
    return new SizeModifierImpl(width, width, undefined, undefined, false)
}

export function RequiredHeightModifier(height: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, height, height, false)
}


// Required size in


export function RequiredSizeInModifier(values: {
    minWidth?: number,
    maxWidth?: number | null,
    minHeight?: number,
    maxHeight?: number | null,
}): ModifierElement {
    return new SizeModifierImpl(values.minWidth, values.maxWidth, values.minHeight, values.maxHeight, false)
}
// todo RequiredWidthIn/... maybe


type Unspecified = undefined
class SizeModifierImpl {
    private readonly targetConstraints: Constraints

    constructor(
        public minWidth:  Unspecified | number,
        public maxWidth:  Unspecified | number | null,
        public minHeight: Unspecified | number,
        public maxHeight: Unspecified | number | null,
        public enforceIncoming: boolean,
    ) {
        this.targetConstraints = new Constraints(
            this.minWidth ?? 0,
            this.maxWidth ?? null,
            this.minHeight ?? 0,
            this.maxHeight ?? null,
        )
    }

    [LayoutModifier.symbol] = LayoutModifier((measurable, inputConstraints) => {
        let wrappedConstraints: Constraints

        if (this.enforceIncoming) {
            wrappedConstraints = inputConstraints.constrain(this.targetConstraints)
        } else {
            const minWidth = this.minWidth !== undefined
                ? this.targetConstraints.minWidth
                : (this.targetConstraints.maxWidth === null
                    ? inputConstraints.minWidth
                    : Math.min(inputConstraints.minWidth, this.targetConstraints.maxWidth)
                )

            const maxWidth = this.maxWidth !== undefined
                ? this.targetConstraints.maxWidth
                : (inputConstraints.maxWidth === null
                    ? this.targetConstraints.maxWidth
                    : Math.max(inputConstraints.maxWidth, this.targetConstraints.minWidth)
                )

            const minHeight = this.minHeight !== undefined
                ? this.targetConstraints.minHeight
                : (this.targetConstraints.maxHeight === null
                    ? inputConstraints.minHeight
                    : Math.min(inputConstraints.minHeight, this.targetConstraints.maxHeight)
                )

            const maxHeight = this.maxHeight !== undefined
                ? this.targetConstraints.maxHeight
                : (inputConstraints.maxHeight === null
                    ? this.targetConstraints.maxHeight
                    : Math.max(inputConstraints.maxHeight, this.targetConstraints.minHeight)
                )

            wrappedConstraints = new Constraints(minWidth, maxWidth, minHeight, maxHeight)
        }

        const placeable = measurable.measure(wrappedConstraints)

        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(0, 0)
        })
    })

    equals(other: ModifierElement): boolean {
        return other instanceof SizeModifierImpl
            && this.minWidth === other.minWidth
            && this.maxWidth === other.maxWidth
            && this.minHeight === other.minHeight
            && this.maxHeight === other.maxHeight
            && this.enforceIncoming === other.enforceIncoming
    }
}
