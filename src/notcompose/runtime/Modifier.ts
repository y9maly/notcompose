export interface ModifierElement {
    equals(other: ModifierElement): boolean
}

/**
 * todo Я всё ещё думаю над API модификаторов.
 *   Жалко что в JS нету extension функций)
 *   API для использования может изменится в любой момент
 *   API для создания модифаеров точно изменится
 */
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

export function createModifierType<M extends { elements: ReadonlyArray<ModifierElement> }>(
    constructor: new (elements: ReadonlyArray<ModifierElement>) => M,
): Modifier & M & ((modifier: Modifier) => Modifier & M) {
    return createModifier([], constructor)
}

function createModifier<M extends { elements: ReadonlyArray<ModifierElement> }>(
    baseElements: ReadonlyArray<ModifierElement>,
    constructor: new (elements: ReadonlyArray<ModifierElement>) => M,
): Modifier & M & ((modifier: Modifier) => Modifier & M) {
    const base = new constructor(baseElements)

    const modifier = {
        ...base,
        then(...elements: ReadonlyArray<ModifierElement>): Modifier & M {
            return createModifier([...baseElements, ...elements], constructor)
        }
    }

    return Object.setPrototypeOf(
        Object.assign(
            (modifier: Modifier) => createModifier(modifier.elements, constructor),
            modifier
        ),
        Object.getPrototypeOf(base)
    )
}
