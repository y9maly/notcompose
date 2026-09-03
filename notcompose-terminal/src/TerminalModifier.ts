import { createModifierCollection, Modifier as BaseModifier, ModifierCollection, type ModifierElement } from '@notcompose/core'
import { fillMaxHeight, fillMaxSize, fillMaxWidth, height, offset, padding, size, width } from '@notcompose/layout'
import { Color } from './runtime/ui/Color.js'
import { background } from './runtime/modifiers/BackgroundModifier.js'

class TerminalCollection extends ModifierCollection {
    constructor(
        public readonly elements: ReadonlyArray<ModifierElement> = []
    ) { super() }

    padding(all: number): this
    padding(horizontal: number, vertical: number): this
    padding(start: number, top: number, end: number, bottom: number): this
    padding(
        paddingValues:
            | { all?: number }
            | { vertical?: number, horizontal?: number }
            | { vertical?: number, start?: number, end?: number }
            | { horizontal?: number, top?: number, bottom?: number }
            | { start?: number, top?: number, end?: number, bottom?: number }
    ): this
    padding(...args: any[]): this {
        // @ts-ignore
        // eslint-disable-next-line explicit-any/no-unsafe-argument
        return this.then(...this.elements, padding(...args))
    }

    offset(x: number): this
    offset(x: number, y: number): this
    offset(params: { x?: number, y?: number }): this
    offset(...args: any[]): this {
        // @ts-ignore
        return this.then(offset(...args))
    }

    size(all: number): this
    size(width: number, height: number): this
    size(...args: any[]): this {
        // @ts-ignore
        // eslint-disable-next-line explicit-any/no-unsafe-argument
        return this.then(...this.elements, size(...args))
    }

    width(value: number): this {
        return this.then(...this.elements, width(value))
    }

    height(value: number): this {
        return this.then(...this.elements, height(value))
    }

    fillMaxWidth(fraction?: number): this {
        return this.then(...this.elements, fillMaxWidth(fraction))
    }

    fillMaxHeight(fraction?: number): this {
        return this.then(...this.elements, fillMaxHeight(fraction))
    }

    fillMaxSize(fraction?: number): this {
        return this.then(...this.elements, fillMaxSize(fraction))
    }

    background(
        symbol: string,
        params?: {
            color?: Color | null
        }
    ): this {
        return this.then(...this.elements, background(symbol, params))
    }
}

export type Modifier = BaseModifier
export const Modifier: Modifier & TerminalCollection = createModifierCollection(TerminalCollection)
