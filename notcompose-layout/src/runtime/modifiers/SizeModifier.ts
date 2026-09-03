import type { ModifierElement } from '@notcompose/core'
import { LayoutModifier } from './LayoutModifier.js'
import { Constraints } from '../Constraints.js'
import { MeasureResult } from '../Measurable.js'

// Fixed size


export function size(all: number): ModifierElement
export function size(width: number, height: number): ModifierElement
export function size(a: number, b?: number): ModifierElement {
    if (b === undefined)
        return new SizeModifierImpl(a, a, a, a, true)
    return new SizeModifierImpl(a, a, b, b, true)
}

export function width(width: number): ModifierElement {
    return widthIn(width, width)
}

export function height(height: number): ModifierElement {
    return heightIn(height, height)
}


// Size in


export function sizeIn(values: {
    minWidth?: number
    maxWidth?: number | null
    minHeight?: number
    maxHeight?: number | null
}): ModifierElement {
    return new SizeModifierImpl(values.minWidth, values.maxWidth, values.minHeight, values.maxHeight, true)
}

export function widthIn(minWidth: number, maxWidth: number): ModifierElement {
    return new SizeModifierImpl(minWidth, maxWidth, undefined, undefined, true)
}

export function minWidth(minWidth: number): ModifierElement {
    return new SizeModifierImpl(minWidth, undefined, undefined, undefined, true)
}

export function maxWidth(maxWidth: number): ModifierElement {
    return new SizeModifierImpl(undefined, maxWidth, undefined, undefined, true)
}

export function heightIn(minHeight: number, maxHeight: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, minHeight, maxHeight, true)
}

export function minHeight(minHeight: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, minHeight, undefined, true)
}

export function maxHeight(maxHeight: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, undefined, maxHeight, true)
}


// Required size


export function requiredSize(all: number): ModifierElement {
    return new SizeModifierImpl(all, all, all, all, false)
}

export function requiredWidth(width: number): ModifierElement {
    return new SizeModifierImpl(width, width, undefined, undefined, false)
}

export function requiredHeight(height: number): ModifierElement {
    return new SizeModifierImpl(undefined, undefined, height, height, false)
}


// Required size in


export function requiredSizeIn(values: {
    minWidth?: number
    maxWidth?: number | null
    minHeight?: number
    maxHeight?: number | null
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
