import type { Key } from '../composer/Composer.js'
import { currentRecomputeScope } from './currentRecomputeScope.js'

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
    b?: () => T,
): T {
    if (arguments.length === 2)
        return rememberPositional(a as unknown[], b!)
    return rememberPositional(a as () => T)
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
    b?: () => T,
): T {
    let recomputeKeys: unknown[]
    let calculation: () => T

    if (arguments.length === 2) {
        recomputeKeys = a as unknown[]
        calculation = b! satisfies () => T
    } else {
        recomputeKeys = []
        calculation = a as () => T
    }

    return currentRecomputeScope().rememberPositional(recomputeKeys, calculation)
}

function rememberKeyed<T>(
    rememberKey: Key,
    calculation: () => T
): T

function rememberKeyed<T>(
    rememberKey: Key,
    recomputeKeys: unknown[],
    calculation: () => T
): T

function rememberKeyed<T>(
    rememberKey: Key,
    a: unknown[] | (() => T),
    b?: () => T,
): T {
    let recomputeKeys: unknown[]
    let calculation: () => T

    if (arguments.length === 2) {
        recomputeKeys = a as unknown[]
        calculation = b! satisfies () => T
    } else {
        recomputeKeys = []
        calculation = a as () => T
    }

    return currentRecomputeScope().rememberKeyed(rememberKey, recomputeKeys, calculation)
}
