import { LayoutModifier } from './LayoutModifier.js'
import type { ModifierElement } from '@notcompose/core'
import { MeasureResult } from '../Measurable.js'

export function padding(all: number): ModifierElement
export function padding(horizontal: number, vertical: number): ModifierElement
export function padding(start: number, top: number, end: number, bottom: number): ModifierElement
export function padding(
    paddingValues:
        | { all?: number }
        | { vertical?: number, horizontal?: number }
        | { vertical?: number, start?: number, end?: number }
        | { horizontal?: number, top?: number, bottom?: number }
        | { start?: number, top?: number, end?: number, bottom?: number }
): ModifierElement

export function padding(
    a: number | {
        all?: number
        horizontal?: number, start?: number, end?: number
        vertical?: number, top?: number, bottom?: number
    },
    b?: number,
    c?: number,
    d?: number,
): ModifierElement {
    let start, top, end, bottom
    if (typeof a === 'object') {
        start = a.start ?? a.horizontal ?? a.all ?? 0
        end = a.end ?? a.horizontal ?? a.all ?? 0
        bottom = a.bottom ?? a.vertical ?? a.all ?? 0
        top = a.top ?? a.vertical ?? a.all ?? 0
    } else if (b === undefined) {
        start = top = end = bottom = a
    } else if (c === undefined || d === undefined) {
        start = end = a
        top = bottom = b
    } else {
        start = a; top = b; end = c; bottom = d
    }

    return new PaddingModifierImpl(start, top, end, bottom)
}

class PaddingModifierImpl {
    constructor(
        public start: number,
        public top: number,
        public end: number,
        public bottom: number,
    ) {}

    [LayoutModifier.symbol] = LayoutModifier((measurable, constraints) => {
        const horizontal = this.start + this.end
        const vertical = this.top + this.bottom

        const placeable = measurable.measure(constraints.offset(-horizontal, -vertical))

        const width = constraints.constrainWidth(placeable.width + horizontal)
        const height = constraints.constrainHeight(placeable.height + vertical)
        return MeasureResult(width, height, () => {
            placeable.place(this.start, this.top)
        })
    })

    equals(other: ModifierElement): boolean {
        return other instanceof PaddingModifierImpl
            && this.start === other.start
            && this.top === other.top
            && this.end === other.end
            && this.bottom === other.bottom
    }
}
