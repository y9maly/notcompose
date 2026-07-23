import { createModifierType, Modifier as BaseModifier, ModifierElement } from 'notcompose'
import { padding, size, width, height, fillMaxWidth, fillMaxHeight, fillMaxSize } from 'notcompose/layout'
import { Color } from './runtime/ui/Color.js'
import { background } from './runtime/modifiers/BackgroundModifier.js'

class TerminalModifier {
    constructor(
        public readonly elements: ReadonlyArray<ModifierElement> = []
    ) {}

    // todo
    // todo
    // todo
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
        // todo
        // @ts-ignore
        // eslint-disable-next-line explicit-any/no-unsafe-argument
        return Modifier.then(...this.elements, padding(...args))
    }

    size(all: number): this
    size(width: number, height: number): this
    size(...args: any[]): this {
        // todo
        // @ts-ignore
        // eslint-disable-next-line explicit-any/no-unsafe-argument
        return Modifier.then(...this.elements, size(...args))
    }

    width(value: number): this {
        // @ts-ignore
        return Modifier.then(...this.elements, width(value))
    }

    height(value: number): this {
        // @ts-ignore
        return Modifier.then(...this.elements, height(value))
    }

    fillMaxWidth(fraction?: number): this {
        // @ts-ignore
        return Modifier.then(...this.elements, fillMaxWidth(fraction))
    }

    fillMaxHeight(fraction?: number): this {
        // @ts-ignore
        return Modifier.then(...this.elements, fillMaxHeight(fraction))
    }

    fillMaxSize(fraction?: number): this {
        // @ts-ignore
        return Modifier.then(...this.elements, fillMaxSize(fraction))
    }

    background(
        symbol: string,
        params?: {
            color?: Color | null
        }
    ): this {
        // @ts-ignore
        return Modifier.then(...this.elements, background(symbol, params))
    }
}

export type Modifier = BaseModifier
export const Modifier = createModifierType(TerminalModifier)
