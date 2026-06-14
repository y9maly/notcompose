import {Measurer} from "./Measurer.js";

let value: Measurer | null = null

export function withMeasurer<R>(measurer: Measurer, block: () => R): R {
    const previous = currentMeasurerOrNull()
    try {
        setCurrentMeasurerUnsafe(measurer)
        return block()
    } finally {
        setCurrentMeasurerUnsafe(previous)
    }
}

export function setCurrentMeasurerUnsafe(measurer: Measurer | null) {
    value = measurer
}

export function currentMeasurerOrNull(): Measurer | null {
    return value
}

export function currentMeasurer(): Measurer {
    if (value === null)
        throw new Error('No current measurer')
    return value
}
