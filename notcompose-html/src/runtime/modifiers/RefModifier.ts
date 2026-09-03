import type { ModifierElement } from '@notcompose/core'

export interface DomRef<ELEMENT extends Element> {
    (element: ELEMENT): void | (() => void)
}

export class RefModifier<ELEMENT extends Element = Element> implements ModifierElement {
    constructor(
        public readonly effect: DomRef<ELEMENT>,
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof RefModifier && other.effect === this.effect
    }
}
