import {ModifierElement} from "../Modifier.js";


/**
 * Для дебага
 */
export function NameModifier(name: string): NameElement {
    return new NameElement(name)
}

export class NameElement implements ModifierElement {
    constructor(public name: string) {}

    toString() {
        return `Node(${this.name})`
    }

    equals(other: ModifierElement): boolean {
        return other instanceof NameElement && other.name === this.name
    }
}
