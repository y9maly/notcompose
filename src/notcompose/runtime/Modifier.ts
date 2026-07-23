import { assertAny } from 'notcompose'

export interface ModifierElement {
    equals(other: ModifierElement): boolean
}

export interface Modifier {
    readonly elements: ReadonlyArray<ModifierElement>

    then(...elements: ReadonlyArray<ModifierElement>): this
}

interface ModifierConstructor extends Modifier {
    readonly elements: ReadonlyArray<ModifierElement>
}

export const Modifier: ModifierConstructor = {
    elements: [],

    then(...elements: ReadonlyArray<ModifierElement>): Modifier {
        return new ModifierImpl(elements)
    }
}

class ModifierImpl implements Modifier {
    constructor(
        public readonly elements: ReadonlyArray<ModifierElement> = []
    ) {}

    then(...elements: ReadonlyArray<ModifierElement>): this {
        const modifier = new ModifierImpl([...this.elements, ...elements])
        return modifier as this
    }
}

export type ModifierCollection<MC> = Modifier & MC

export type ModifierCollectionDefinition<MC> = ModifierCollection<MC> & {
    (modifier: Modifier): ModifierCollection<MC>
}

export function createModifierCollection<MC extends { elements: ReadonlyArray<ModifierElement> }>(
    constructor: new (elements: ReadonlyArray<ModifierElement>) => MC,
): ModifierCollectionDefinition<MC> {
    return _createModifierCollectionDefinition(constructor)
}

function _createModifierCollectionDefinition<MC extends { elements: ReadonlyArray<ModifierElement> }>(
    constructor: new (elements: ReadonlyArray<ModifierElement>) => MC,
): ModifierCollectionDefinition<MC> {
    const modifierCollection: ModifierCollection<MC> = _createModifierCollection([], constructor)

    const modifierCollectionDefinition: ModifierCollectionDefinition<MC> = Object.assign(
        (modifier: Modifier) => _createModifierCollection(modifier.elements, constructor),
        modifierCollection
    )

    Object.setPrototypeOf(modifierCollectionDefinition, assertAny(Object.getPrototypeOf(modifierCollection)))

    return modifierCollectionDefinition
}

function _createModifierCollection<MC extends { elements: ReadonlyArray<ModifierElement> }>(
    baseElements: ReadonlyArray<ModifierElement>,
    constructor: new (elements: ReadonlyArray<ModifierElement>) => MC,
): ModifierCollection<MC> {
    const base: MC = new constructor(baseElements)

    const modifierCollection: ModifierCollection<MC> = {
        ...base,
        then(...elements: ReadonlyArray<ModifierElement>): ModifierCollection<MC> {
            return _createModifierCollection([...baseElements, ...elements], constructor)
        }
    }

    Object.setPrototypeOf(modifierCollection, assertAny(Object.getPrototypeOf(base)))

    return modifierCollection
}
