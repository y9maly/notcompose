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

    then(...elements: ModifierElement[]): Modifier
}

interface ModifierConstructor extends Modifier {
    readonly elements: readonly []
}

export const Modifier: ModifierConstructor = {
    elements: [],

    then(...elements: ModifierElement[]): Modifier {
        return new ModifierImpl(elements)
    }
}

class ModifierImpl implements Modifier {
    constructor(
        public readonly elements: ReadonlyArray<ModifierElement> = []
    ) {}

    then(...elements: ModifierElement[]): Modifier {
        return new ModifierImpl([...this.elements, ...elements])
    }
}
