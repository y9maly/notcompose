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

export type ModifierCollectionConstructor<ModifierCollection> = new (elements: ReadonlyArray<ModifierElement>) => ModifierCollection

export type ExtendedModifier<MC> = Modifier & MC & {
    (modifier: Modifier): ExtendedModifier<MC>
}

export function createExtendedModifier<MC extends { elements: ReadonlyArray<ModifierElement> }>(
    Collection: ModifierCollectionConstructor<MC>,
): ExtendedModifier<MC> {
    const cast = (modifier: Modifier): ExtendedModifier<MC> => _createExtendedModifier(cast, modifier.elements, Collection)
    return _createExtendedModifier(cast, [], Collection)
}

function _createExtendedModifier<MC extends { elements: ReadonlyArray<ModifierElement> }>(
    cast: (modifier: Modifier) => ExtendedModifier<MC>,
    baseElements: ReadonlyArray<ModifierElement>,
    Collection: new (elements: ReadonlyArray<ModifierElement>) => MC,
): ExtendedModifier<MC> {
    const collection: MC = new Collection(baseElements)

    const extensions = {
        then(...elements: ReadonlyArray<ModifierElement>): ExtendedModifier<MC> {
            return _createExtendedModifier(cast, [...baseElements, ...elements], Collection)
        }
    }

    return _merge(cast, extensions, collection)
}

function _merge<BASE extends object, EXTENSIONS extends object, COLLECTION extends object>(
    base: BASE,
    extensions: EXTENSIONS,
    collection: COLLECTION,
): BASE & EXTENSIONS & COLLECTION {
    const sources: readonly object[] = [
        base,
        extensions,
        collection,
    ]

    function sourceOf(property: PropertyKey): object | undefined {
        return sources.find(source => Reflect.has(source, property))
    }

    function ownSourceOf(property: PropertyKey): object | undefined {
        return sources.find(source => Object.hasOwn(source, property))
    }

    return new Proxy(base, {
        get(_, property, receiver): unknown {
            const source = sourceOf(property)
            if (source === undefined)
                return undefined
            return Reflect.get(source, property, receiver)
        },

        set(_, property, value) {
            const source = sourceOf(property) ?? collection
            return Reflect.set(source, property, value, source)
        },

        has(_, property) {
            return sourceOf(property) !== undefined
        },

        ownKeys() {
            const keys = new Set<string | symbol>()
            for (const source of sources) {
                for (const key of Reflect.ownKeys(source))
                    keys.add(key)
            }
            return [...keys]
        },

        getOwnPropertyDescriptor(target, property) {
            const targetDescriptor = Reflect.getOwnPropertyDescriptor(target, property)
            if (targetDescriptor !== undefined)
                return targetDescriptor

            const source = ownSourceOf(property)
            if (source === undefined)
                return undefined

            const descriptor = Reflect.getOwnPropertyDescriptor(source, property)!
            return {
                ...descriptor,
                configurable: true,
            }
        },

        deleteProperty(_, property) {
            const source = ownSourceOf(property)
            if (source === undefined)
                return true
            return Reflect.deleteProperty(source, property)
        },

        preventExtensions() {
            return false
        },
    }) as BASE & EXTENSIONS & COLLECTION
}
