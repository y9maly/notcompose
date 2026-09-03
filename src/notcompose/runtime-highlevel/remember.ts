import { currentComposer } from '../runtime/currentComposer.js'
import type { Key } from '../runtime/Composer.js'

const Empty = Symbol()

export interface remember {
    <T>(calculation: () => T): T
    <T>(keys: unknown[], calculation: () => T): T

    positional<T>(calculation: () => T): T
    positional<T>(keys: unknown[], calculation: () => T): T

    keyed<T>(rememberKey: Key, calculation: () => T): T
    keyed<T>(rememberKey: Key, keys: unknown[], calculation: () => T): T
}

export function remember<T>(calculation: () => T): T
export function remember<T>(keys: unknown[], calculation: () => T): T
export function remember<T>(
    a: unknown[] | (() => T),
    b: (() => T) | typeof Empty = Empty,
): T {
    return rememberPositional(a as any, b as any)
}

remember.positional = rememberPositional
remember.keyed = rememberKeyed


// --- --- ---


function rememberPositional<T>(
    calculation: () => T
): T

function rememberPositional<T>(
    keys: unknown[],
    calculation: () => T
): T

function rememberPositional<T>(
    a: unknown[] | (() => T),
    b: (() => T) | typeof Empty = Empty,
): T {
    let keys: unknown[]
    let calculation: () => T

    if (b === Empty) {
        keys = []
        calculation = a as () => T
    } else {
        keys = a as unknown[]
        calculation = b satisfies () => T
    }

    const previousKeys = currentComposer().hasRememberedValue()
        ? currentComposer().rememberedValue() as unknown[]
        : null
    const firstComposition = previousKeys === null

    if (firstComposition) {
        currentComposer().rememberValue(keys)
        const value = calculation()
        currentComposer().rememberValue(value)
        return value
    }

    if (
        keys.length !== previousKeys.length
        // todo i dont like this `Object.is`
        || keys.some((a, index) => !Object.is(a, previousKeys[index]))
    ) {
        currentComposer().rememberValue(keys)
        const newValue = calculation()
        currentComposer().rememberValue(newValue)
        return newValue
    } else {
        currentComposer().nextRememberedValue()
    }

    return currentComposer().nextRememberedValue() as T
}

function rememberKeyed<T>(
    rememberKey: Key,
    calculation: () => T
): T

function rememberKeyed<T>(
    rememberKey: Key,
    keys: unknown[],
    calculation: () => T
): T

function rememberKeyed<T>(
    rememberKey: Key,
    a: unknown[] | (() => T),
    b: (() => T) | typeof Empty = Empty,
): T {
    let keys: unknown[]
    let calculation: () => T

    if (b === Empty) {
        keys = []
        calculation = a as () => T
    } else {
        keys = a as unknown[]
        calculation = b satisfies () => T
    }

    const previous = currentComposer().hasRememberedKeyedValue(rememberKey)
        ? currentComposer().rememberedKeyedValue(rememberKey) as [unknown[], T]
        : null
    const firstComposition = previous === null

    if (firstComposition) {
        const value = calculation()
        currentComposer().rememberKeyedValue(rememberKey, [keys, value])
        return value
    }
    const [previousKeys, previousValue] = previous

    if (
        keys.length !== previousKeys.length
        // todo i dont like this `Object.is`
        || keys.some((a, index) => !Object.is(a, previousKeys[index]))
    ) {
        const newValue = calculation()
        currentComposer().rememberKeyedValue(rememberKey, [keys, newValue])
        return newValue
    } else {
        return previousValue
    }
}
