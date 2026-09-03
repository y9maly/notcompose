import { elvis, error, Recomposer } from '@notcompose/core'
import { currentTestRuntime } from './TestRuntime.js'

export function currentRecomposer(): Recomposer {
    const recomposer = currentTestRuntime()['recomposer']
    if (!(recomposer instanceof Recomposer)) error(`recomposer doesn't exist in this test runtime`)
    return recomposer
}

export function needRecompose() {
    return currentRecomposer().needRecompose()
}

export function recompose() {
    currentRecomposer().recompose(currentTestRuntime().composer)
}

export function flushRecompositions(max: number | null = 1000, options?: { shouldThrow?: boolean }): number {
    const { shouldThrow } = elvis(options, {
        shouldThrow: true,
    })

    let recompositions = 0
    while (currentRecomposer().needRecompose()) {
        recompositions++
        currentRecomposer().recompose(currentTestRuntime().composer)
        if (max && recompositions >= max) {
            if (shouldThrow)
                throw new Error(`Maximum recompositions count reached: ${max}`)
            break
        }
    }
    return recompositions
}
