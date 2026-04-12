import {currentComposer} from "../runtime/currentComposer.js";


const Empty = Symbol()

export function remember<T>(
    calculation: () => T
): T

export function remember<T>(
    keys: unknown[],
    calculation: () => T
): T

export function remember<T>(
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
        calculation = b as () => T
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
        keys.length !== previousKeys.length ||
        keys.some((a, index) => !Object.is(a, previousKeys[index]))
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

