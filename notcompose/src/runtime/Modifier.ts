import { KeyModifier } from './modifiers/KeyModifier.js'

export interface ModifierElement {
    equals(other: ModifierElement): boolean
}

export interface Modifier {
    readonly elements: ReadonlyArray<ModifierElement>
    then(...elements: ReadonlyArray<ModifierElement | Modifier>): this

    key(key: string | number | boolean): this
}

interface ModifierCompanion extends Modifier {
    readonly elements: readonly []
    then(...elements: ReadonlyArray<ModifierElement | Modifier>): this
}

interface ModifierConstructor extends ModifierCompanion {
    new (): Modifier
}

class ModifierClass implements Modifier {
    public readonly elements: ReadonlyArray<ModifierElement>
    constructor(...elements: ReadonlyArray<ModifierElement>) {
        this.elements = elements
    }

    then(...elements: ReadonlyArray<ModifierElement | Modifier>): this {
        return new ModifierClass(
            ...this.elements,
            ...elements.flatMap(it => it instanceof Modifier ? it.elements : [it])
        ) as this
    }

    key(key: string | number | boolean): this {
        return this.then(new KeyModifier(key.toString()))
    }

    static [Symbol.hasInstance](value: unknown): value is Modifier {
        return (typeof value === 'object' || typeof value === 'function') && (
            // @ts-ignore
            value?.[Symbol.hasInstance] === ModifierClass[Symbol.hasInstance]
            || Function.prototype[Symbol.hasInstance].call(ModifierClass, value)
        )
    }
}

const ModifierClass$Companion: ModifierCompanion = {
    elements: [],

    key(key: string | number | boolean): ModifierCompanion {
        return this.then(new KeyModifier(key.toString()))
    },

    then(...elements: ReadonlyArray<ModifierElement | Modifier>): ModifierCompanion {
        return new ModifierClass(
            ...elements.flatMap(it => it instanceof Modifier ? it.elements : [it])
        ) satisfies Modifier as ModifierCompanion
    }
}

export const Modifier: ModifierConstructor = Object.assign(ModifierClass, ModifierClass$Companion)

// eslint-disable-next-line ts/no-unsafe-declaration-merging
export interface ModifierCollection {
    (modifier: Modifier): this
}

// eslint-disable-next-line ts/no-unsafe-declaration-merging
export abstract class ModifierCollection implements Modifier {
    declare elements: ReadonlyArray<ModifierElement>
    declare then: (...elements: ReadonlyArray<ModifierElement | Modifier>) => this
    declare key: (key: string | number | boolean) => this
}

export function createModifierCollection<COLLECTION>(...collectionConstructors: ReadonlyArray<{ new (): COLLECTION }>): Modifier & COLLECTION {
    const createInstance = () => function ExtendedModifier(modifier: Modifier) {
        return initializeInstance(createInstance(), ...modifier.elements)
    }

    class Instance extends Modifier {}
    // @ts-ignore
    Instance.prototype[Symbol.hasInstance] = Modifier[Symbol.hasInstance]
    for (const collectionConstructor of collectionConstructors) {
        // eslint-disable-next-line explicit-any/no-unsafe-argument
        copyPrototype(Instance.prototype, collectionConstructor.prototype)
    }

    function initializeInstance(instance: any, ...elements: ReadonlyArray<ModifierElement | Modifier>): Modifier & COLLECTION {
        Object.setPrototypeOf(instance, Instance.prototype)

        instance.elements = elements.flatMap(it => it instanceof Modifier ? it.elements : [it]) satisfies ModifierElement[]
        instance.then = function (...newElements: ReadonlyArray<ModifierElement | Modifier>): Modifier {
            return initializeInstance(createInstance(), ...elements, ...newElements)
        }

        return instance as Modifier & COLLECTION
    }

    return initializeInstance(createInstance())
}

function copyPrototype(target: object, source: object) {
    for (const key of Reflect.ownKeys(source)) {
        if (key === 'constructor') continue
        const descriptor = Object.getOwnPropertyDescriptor(source, key)
        if (descriptor) Object.defineProperty(target, key, descriptor)
    }
}
