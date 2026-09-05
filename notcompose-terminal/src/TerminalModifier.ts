import { createModifierCollection, Modifier as BaseModifier, ModifierCollection, type ModifierElement } from '@notcompose/core'
import { Constraints, ConstraintsModifiers, fillMaxHeight, fillMaxSize, fillMaxWidth, height, LayoutModifier, type Measurable, MeasureResult, offset, offsetX, offsetY, padding, size, width } from '@notcompose/layout'
import { Color } from './runtime/ui/Color.js'
import { background } from './runtime/modifiers/BackgroundModifier.js'
import { DrawScope } from './runtime/ui/graphics/DrawScope.js'
import { drawBehind, DrawModifier } from './runtime/modifiers/DrawModifier.js'
import { ContentDrawScope } from './runtime/ui/graphics/ContentDrawScope.js'
import { handleInput } from './runtime/modifiers/InputHandler.js'
import { AnnotatedString } from './runtime/ui/AnnotatedString.js'
import { drawText } from './runtime/modifiers/TextModifier.js'
import { border } from './runtime/modifiers/BorderModifier.js'

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
        return this.then(padding(...args))
    }

    offset(x: number): this
    offset(x: number, y: number): this
    offset(params: { x?: number, y?: number }): this
    offset(...args: any[]): this {
        // @ts-ignore
        return this.then(offset(...args))
    }

    offsetX(offset: number): this {
        return this.then(offsetX(offset))
    }

    offsetY(offset: number): this {
        return this.then(offsetY(offset))
    }

    size(all: number): this
    size(width: number, height: number): this
    size(...args: any[]): this {
        // @ts-ignore
        // eslint-disable-next-line explicit-any/no-unsafe-argument
        return this.then(size(...args))
    }

    width(value: number): this {
        return this.then(width(value))
    }

    height(value: number): this {
        return this.then(height(value))
    }

    fillMaxWidth(fraction?: number): this {
        return this.then(fillMaxWidth(fraction))
    }

    fillMaxHeight(fraction?: number): this {
        return this.then(fillMaxHeight(fraction))
    }

    fillMaxSize(fraction?: number): this {
        return this.then(fillMaxSize(fraction))
    }

    minusMaxHeight(value: number): this {
        return this.then(ConstraintsModifiers.minusMaxHeight(value))
    }

    minusMaxWidth(value: number): this {
        return this.then(ConstraintsModifiers.minusMaxWidth(value))
    }

    layout(measure: (measurable: Measurable, constraints: Constraints) => MeasureResult): this {
        return this.then(LayoutModifier(measure))
    }

    background(
        symbol: string,
        params?: {
            color?: Color | null
        }
    ): this {
        return this.then(background(symbol, params))
    }

    border(params?: {
        color?: Color | null
        topStart?: string
        topEnd?: string
        bottomStart?: string
        bottomEnd?: string
        verticalStart?: string
        verticalEnd?: string
        horizontalTop?: string
        horizontalBottom?: string
    }): this {
        return this.then(border(params))
    }

    drawBehind(draw: (scope: DrawScope) => void): this {
        return this.then(drawBehind(draw))
    }

    drawContent(draw: (scope: ContentDrawScope) => void): this {
        return this.then(DrawModifier(draw))
    }

    drawText(text: string | AnnotatedString): this {
        return this.then(drawText(text))
    }

    handleInput(block: (string: string, key: unknown) => boolean): this {
        return this.then(handleInput(block))
    }
}

export type Modifier = BaseModifier
export const Modifier: Modifier & TerminalCollection = createModifierCollection(TerminalCollection)
