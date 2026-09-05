import { Composer } from './Composer.js'

let value: Composer | null = null

export function withComposer<R>(composer: Composer, block: () => R): R {
    const previous = currentComposerOrNull()
    try {
        setCurrentComposerUnsafe(composer)
        return block()
    } finally {
        setCurrentComposerUnsafe(previous)
    }
}

export function setCurrentComposerUnsafe(composer: Composer | null) {
    value = composer
}

export function currentComposerOrNull(): Composer | null {
    return value
}

export function currentComposer(): Composer {
    if (value === null)
        throw new Error('No current composer')
    return value
}
