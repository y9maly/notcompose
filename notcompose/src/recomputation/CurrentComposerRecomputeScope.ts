import type { RecomputeScope } from './RecomputeScope.js'
import { currentComposer } from '../composer/currentComposer.js'

class $CurrentComposerRecomputeScope implements RecomputeScope {
    rememberPositional<T>(recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        const previousKeys = currentComposer().hasRememberedValue()
            ? currentComposer().rememberedValue() as unknown[]
            : null
        const firstComposition = previousKeys === null

        if (firstComposition) {
            currentComposer().rememberValue(recomputeKeys)
            const value = calculation()
            currentComposer().rememberValue(value)
            return value
        }

        if (
            recomputeKeys.length !== previousKeys.length
            // todo i dont like this `Object.is`
            || recomputeKeys.some((a, index) => !Object.is(a, previousKeys[index]))
        ) {
            currentComposer().rememberValue(recomputeKeys)
            const newValue = calculation()
            currentComposer().rememberValue(newValue)
            return newValue
        } else {
            currentComposer().nextRememberedValue()
        }

        return currentComposer().nextRememberedValue() as T
    }

    rememberKeyed<T>(rememberKey: string | number | boolean, recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        const previous = currentComposer().hasRememberedKeyedValue(rememberKey)
            ? currentComposer().rememberedKeyedValue(rememberKey) as [unknown[], T]
            : null
        const firstComposition = previous === null

        if (firstComposition) {
            const value = calculation()
            currentComposer().rememberKeyedValue(rememberKey, [recomputeKeys, value])
            return value
        }
        const [previousKeys, previousValue] = previous

        if (
            recomputeKeys.length !== previousKeys.length
            // todo i dont like this `Object.is`
            || recomputeKeys.some((a, index) => !Object.is(a, previousKeys[index]))
        ) {
            const newValue = calculation()
            currentComposer().rememberKeyedValue(rememberKey, [recomputeKeys, newValue])
            return newValue
        } else {
            return previousValue
        }
    }
}

export const CurrentComposerRecomputeScope: RecomputeScope = new $CurrentComposerRecomputeScope()
