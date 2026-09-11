import type { RecomputeScope } from './RecomputeScope.js'
import { outsideComposition } from '../composition/currentCompositionRun.js'
import type { Composer } from '../composer/Composer.js'

export class ComposerRecomputeScope implements RecomputeScope {
    private leaves = 0
    private isLeaved = false

    constructor(private readonly composer: Composer) {}

    rememberPositional<T>(recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        if (this.isLeaved)
            throw new Error('You cannot remember values here because this recomputeScope is leaved')

        const previousKeys = this.composer.hasRememberedValue()
            ? this.composer.rememberedValue() as unknown[]
            : null
        const firstComposition = previousKeys === null

        if (firstComposition) {
            const value = outsideComposition(calculation)
            this.composer.rememberValue(recomputeKeys)
            this.composer.rememberValue(value)
            return value
        }

        if (
            recomputeKeys.length !== previousKeys.length
            // todo i dont like this `Object.is`
            || recomputeKeys.some((it, index) => !Object.is(it, previousKeys[index]))
        ) {
            const newValue = outsideComposition(calculation)
            this.composer.rememberValue(recomputeKeys)
            this.composer.rememberValue(newValue)
            return newValue
        } else {
            this.composer.nextRememberedValue()
        }

        return this.composer.nextRememberedValue() as T
    }

    rememberKeyed<T>(rememberKey: string | number | boolean, recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        if (this.isLeaved)
            throw new Error('You cannot remember values here because this recomputeScope is leaved')

        const previous = this.composer.hasRememberedKeyedValue(rememberKey)
            ? this.composer.rememberedKeyedValue(rememberKey) as [unknown[], T]
            : null
        const firstComposition = previous === null

        if (firstComposition) {
            const value = outsideComposition(calculation)
            this.composer.rememberKeyedValue(rememberKey, [recomputeKeys, value])
            return value
        }
        const [previousKeys, previousValue] = previous

        if (
            recomputeKeys.length !== previousKeys.length
            // todo i dont like this `Object.is`
            || recomputeKeys.some((it, index) => !Object.is(it, previousKeys[index]))
        ) {
            const newValue = outsideComposition(calculation)
            this.composer.rememberKeyedValue(rememberKey, [recomputeKeys, newValue])
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
