

export interface ModifierElement {
    equals(other: ModifierElement): boolean
}

export class Modifier {
    constructor(
        public elements: ReadonlyArray<ModifierElement> = []
    ) {}

    then(...elements: ModifierElement[]): Modifier {
        return new Modifier([...this.elements, ...elements])
    }
}
