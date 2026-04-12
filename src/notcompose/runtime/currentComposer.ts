import {Composer} from "./Composer.js";

let value: Composer | null = null

export function setCurrentComposer(composer: Composer | null) {
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