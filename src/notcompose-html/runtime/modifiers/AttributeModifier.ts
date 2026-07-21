import {ModifierElement} from "notcompose";
import {AttributeValue} from "../attributes/attributes.js";

export class AttributeModifier implements ModifierElement {
    constructor(
        public readonly name: string,
        public readonly value: AttributeValue,
    ) {}

    equals(other: ModifierElement): boolean {
        return other instanceof AttributeModifier && other.name === this.name && Object.is(other.value, this.value)
    }
}
