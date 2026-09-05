import type { CompositionRun } from './CompositionRun.js'

let value: CompositionRun | null = null

export function outsideComposition<R>(block: () => R): R {
    const run = currentCompositionRunOrNull()
    if (run === null)
        return block()

    run.leaveComposition()
    try {
        return block()
    } finally {
        run.reenterComposition()
    }
}

export function withCompositionRun<R>(compositionRun: CompositionRun, block: (previous: CompositionRun | null) => R): R {
    const previous = currentCompositionRunOrNull()
    try {
        setCurrentCompositionRunUnsafe(compositionRun)
        return block(previous)
    } finally {
        setCurrentCompositionRunUnsafe(previous)
    }
}

export function setCurrentCompositionRunUnsafe(compositionRun: CompositionRun | null) {
    value = compositionRun
}

export function currentCompositionRunOrNull(): CompositionRun | null {
    return value
}

export function currentCompositionRun(): CompositionRun {
    if (value === null)
        throw new Error('No current composition running; You are outside any composition run')
    return value
}
