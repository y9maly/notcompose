import { LayoutModifier } from './LayoutModifier.js'
import type { ModifierElement } from 'notcompose'
import { MeasureResult } from '../Measurable.js'

export function offset(x: number): ModifierElement
export function offset(x: number, y: number): ModifierElement
export function offset(params: { x?: number, y?: number }): ModifierElement
export function offset(a: any, b?: number): ModifierElement {
    let x, y = 0
    if (typeof a === 'object') {
        x = a.x ?? 0
        y = a.y ?? 0
    } else {
        x = a
        y = b ?? 0
    }

    return new OffsetModifierImpl(x, y ?? 0)
}

export function offsetX(offset: number): ModifierElement {
    return new OffsetModifierImpl(offset, 0)
}

export function offsetY(offset: number): ModifierElement {
    return new OffsetModifierImpl(0, offset)
}

class OffsetModifierImpl {
    constructor(
        private x: number,
        private y: number,
    ) {}

    [LayoutModifier.symbol] = LayoutModifier((measurable, constraints) => {
        const placeable = measurable.measure(constraints)
        return MeasureResult(placeable.width, placeable.height, () => {
            placeable.place(this.x, this.y)
        })
    })

    equals(other: ModifierElement): boolean {
        return other instanceof OffsetModifierImpl
            && this.x === other.x
            && this.y === other.y
    }
}
