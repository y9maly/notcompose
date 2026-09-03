import type { ModifierElement } from '@notcompose/core'

export interface InputHandlerModifier extends ModifierElement {
    pass: 'Initial' | 'Main' | 'Final'
    process(string: string, key: unknown): boolean
}

const symbol = Symbol()
InputHandler.symbol = symbol
InputHandler.is = (o: unknown): o is { [InputHandler.symbol]: InputHandlerModifier } =>
    !(!o || typeof o !== 'object' || !(InputHandler.symbol in o))
InputHandler.of = (o: unknown): InputHandlerModifier | null =>
    InputHandler.is(o) ? o[InputHandler.symbol] : null

export const handleInput = InputHandler
export function InputHandler(
    block: (string: string, key: unknown) => boolean
): InputHandlerModifier {
    return new InputHandlerModifierImpl(block)
}

class InputHandlerModifierImpl implements InputHandlerModifier {
    [InputHandler.symbol] = this

    // todo
    pass = 'Main' as const

    constructor(
        public process: (string: string, key: unknown) => boolean
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof InputHandlerModifierImpl && this.process === other.process
    }
}
