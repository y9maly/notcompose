import type { ModifierElement } from '@notcompose/core'
import { ContentDrawScope } from '../ui/graphics/ContentDrawScope.js'
import { DrawScope } from '../ui/graphics/DrawScope.js'

export interface DrawModifier extends ModifierElement {
    draw(scope: ContentDrawScope): void
}

const symbol = Symbol()
DrawModifier.symbol = symbol
DrawModifier.is = (o: unknown): o is { [DrawModifier.symbol]: DrawModifier } =>
    !(!o || typeof o !== 'object' || !(DrawModifier.symbol in o))
DrawModifier.of = (o: unknown): DrawModifier | null =>
    DrawModifier.is(o) ? o[DrawModifier.symbol] : null

export function drawBehind(draw: (scope: DrawScope) => void): DrawModifier {
    return DrawModifier(scope => {
        scope.drawContent()
        draw(scope)
    })
}

export function DrawModifier(draw: (scope: ContentDrawScope) => void): DrawModifier {
    return new DrawModifierImpl(draw)
}

class DrawModifierImpl implements DrawModifier {
    [DrawModifier.symbol] = this

    constructor(
        public draw: (scope: ContentDrawScope) => void,
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof DrawModifierImpl && this.draw === other.draw
    }
}
