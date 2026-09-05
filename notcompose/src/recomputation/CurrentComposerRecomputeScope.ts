import type { RecomputeScope } from './RecomputeScope.js'
import { currentComposer } from '../composer/currentComposer.js'
import { outsideComposition } from '../composition/currentCompositionRun.js'

class $CurrentComposerRecomputeScope implements RecomputeScope {
    private leaves = 0
    private isLeaved = false

    rememberPositional<T>(recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        if (this.isLeaved)
            throw new Error('You cannot remember values here because this recomputeScope is leaved')

        const previousKeys = currentComposer().hasRememberedValue()
            ? currentComposer().rememberedValue() as unknown[]
            : null
        const firstComposition = previousKeys === null

        if (firstComposition) {
            const value = outsideComposition(calculation)
            currentComposer().rememberValue(recomputeKeys)
            currentComposer().rememberValue(value)
            return value
        }

        if (
            recomputeKeys.length !== previousKeys.length
            // todo i dont like this `Object.is`
            || recomputeKeys.some((it, index) => !Object.is(it, previousKeys[index]))
        ) {
            const newValue = outsideComposition(calculation)
            currentComposer().rememberValue(recomputeKeys)
            currentComposer().rememberValue(newValue)
            return newValue
        } else {
            currentComposer().nextRememberedValue()
        }

        return currentComposer().nextRememberedValue() as T
    }

    rememberKeyed<T>(rememberKey: string | number | boolean, recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        if (this.isLeaved)
            throw new Error('You cannot remember values here because this recomputeScope is leaved')

        const previous = currentComposer().hasRememberedKeyedValue(rememberKey)
            ? currentComposer().rememberedKeyedValue(rememberKey) as [unknown[], T]
            : null
        const firstComposition = previous === null

        if (firstComposition) {
            const value = outsideComposition(calculation)
            currentComposer().rememberKeyedValue(rememberKey, [recomputeKeys, value])
            return value
        }
        const [previousKeys, previousValue] = previous

        if (
            recomputeKeys.length !== previousKeys.length
            // todo i dont like this `Object.is`
            || recomputeKeys.some((it, index) => !Object.is(it, previousKeys[index]))
        ) {
            const newValue = outsideComposition(calculation)
            currentComposer().rememberKeyedValue(rememberKey, [recomputeKeys, newValue])
            return newValue
        } else {
            return previousValue
        }
    }

    leaveRecomputeScope(): void {
        this.leaves++
        this.isLeaved = true
    }

    reenterRecomputeScope(): void {
        if (!this.isLeaved)
            throw new Error(`'reenterRecomputeScope' can be called only after 'leaveRecomputeScope'`)
        this.leaves--
        if (this.leaves === 0) {
            this.isLeaved = false
        }
    }
}

export const CurrentComposerRecomputeScope: RecomputeScope = new $CurrentComposerRecomputeScope()
