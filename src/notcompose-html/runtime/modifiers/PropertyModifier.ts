import {ModifierElement} from "notcompose";

export class PropertyModifier implements ModifierElement {
    constructor(
        public readonly update: (element: Element) => void,
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof PropertyModifier && other.update === this.update
    }
}
