import type { RecomputeScope } from './RecomputeScope.js'

let value: RecomputeScope | null = null

export function withRecomputeScope<R>(recomputeScope: RecomputeScope, block: () => R): R {
    const previous = currentRecomputeScopeOrNull()
    try {
        setCurrentRecomputeScopeUnsafe(recomputeScope)
        return block()
    } finally {
        setCurrentRecomputeScopeUnsafe(previous)
    }
}

export function setCurrentRecomputeScopeUnsafe(recomputeScope: RecomputeScope | null) {
    value = recomputeScope
}

export function currentRecomputeScopeOrNull(): RecomputeScope | null {
    return value
}

export function currentRecomputeScope(): RecomputeScope {
    if (value === null)
        throw new Error('No current recompute scope; You are outside any recompute scope')
    return value
}
