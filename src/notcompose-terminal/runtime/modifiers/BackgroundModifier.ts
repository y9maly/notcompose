import { elvis, ModifierElement } from 'notcompose'
import { DrawModifier } from './DrawModifier.js'
import { ContentDrawScope } from '../ui/graphics/ContentDrawScope.js'
import { Color } from '../ui/Color.js'
import { colored } from '../ui/AnnotatedString.js'

export function background(
    symbol: string,
    params?: {
        color?: Color | null
    }
): ModifierElement {
    const { color } = elvis(params, {
        color: null,
    })

    return new BackgroundModifierImpl(symbol, color)
}

class BackgroundModifierImpl implements DrawModifier {
    [DrawModifier.symbol] = this

    constructor(private symbol: string, private color: Color | null) {}

    draw(scope: ContentDrawScope) {
        const string = this.color !== null
            ? colored(this.color, this.symbol)
            : this.symbol

        for (let x = 0; x < scope.availableWidth; x++) {
            for (let y = 0; y < scope.availableHeight; y++) {
                scope.drawText(x, y, string)
            }
        }

        scope.drawContent()
    }

    equals(other: ModifierElement): boolean {
        return other instanceof BackgroundModifierImpl && other.symbol === this.symbol
    }
}
