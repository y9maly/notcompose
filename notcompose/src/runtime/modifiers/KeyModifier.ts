import type { ModifierElement } from '../Modifier.js'

export class KeyModifier implements ModifierElement {
    constructor(
        public readonly key: string,
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof KeyModifier && this.key === other.key
    }
}
