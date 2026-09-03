import type { ModifierElement } from 'notcompose'

export type StyleValue = string | number | null | undefined

export class StyleModifier implements ModifierElement {
    constructor(
        public readonly name: string,
        public readonly value: StyleValue,
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof StyleModifier
            && other.name === this.name
            && Object.is(other.value, this.value)
    }
}
