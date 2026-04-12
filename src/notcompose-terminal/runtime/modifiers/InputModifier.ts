import {ModifierElement} from "../../../notcompose/runtime/Modifier";


export interface InputModifier extends ModifierElement {
    pass: 'Initial' | 'Main' | 'Final'
    process(string: string, key: unknown): boolean
}

const symbol = Symbol()
InputModifier.symbol = symbol
InputModifier.is = (o: unknown): o is { [symbol]: InputModifier } =>
    !(!o || typeof o !== 'object' || !(InputModifier.symbol in o));
InputModifier.of = (o: unknown): InputModifier | null =>
    InputModifier.is(o) ? o[symbol] : null

export function InputModifier(
    block: (string: string, key: unknown) => boolean
): InputModifier {
    return new InputModifierImpl(block)
}

class InputModifierImpl implements InputModifier {
    [InputModifier.symbol] = this;

    // todo
    pass = 'Main' as const

    constructor(
        public process: (string: string, key: unknown) => boolean
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof InputModifierImpl && this.process === other.process
    }
}
