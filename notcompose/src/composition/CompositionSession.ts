import type { Composer } from '../composer/Composer.js'
import type { CompositionPlugin } from './CompositionPlugin.js'
import type { CompositionRun } from './CompositionRun.js'
import { currentCompositionRunOrNull, setCurrentCompositionRunUnsafe } from './currentCompositionRun.js'

/**
 * Управляет первой и всеми последующими композициями
 */
export interface CompositionSession {
    readonly composer: Composer
    compose<R>(block: () => R, runOptions?: { debugInformation?: string }): R
    dispose(): void
}

export class CompositionSessionDefault implements CompositionSession {
    constructor(
        public readonly composer: Composer,
        private readonly plugins: ReadonlyArray<CompositionPlugin> = [],
    ) {}

    compose<R>(block: () => R, runOptions?: { debugInformation?: string }): R {
        const run: CompositionRun = {
            session: this,
            debugInformation: runOptions?.debugInformation,
        }

        const previousRun = currentCompositionRunOrNull()
        this.plugins.forEach(plugin => plugin.onEnterRun?.(previousRun, run))
        if (currentCompositionRunOrNull() !== previousRun)
            throw new Error(`Composition plugin cannot change current composition run inside 'onEnterRun'.`)

        let runResult: { completedExceptionally: false, result: R } | { completedExceptionally: true, exception: unknown }
        setCurrentCompositionRunUnsafe(run)
        try {
            const result = block()
            runResult = { completedExceptionally: false, result: result } as const
        } catch (e) {
            runResult = { completedExceptionally: true, exception: e } as const
        } finally {
            setCurrentCompositionRunUnsafe(previousRun)
        }

        if (!runResult.completedExceptionally) {
            this.plugins.forEach(plugin => plugin.onExitRun?.(run, previousRun, runResult))
            if (currentCompositionRunOrNull() !== previousRun)
                throw new Error(`Composition plugin cannot change current composition run inside 'onExitRun'.`)

            return runResult.result
        } else {
            this.plugins.forEach(plugin => plugin.onExitRun?.(run, previousRun, runResult))
            if (currentCompositionRunOrNull() !== previousRun)
                throw new Error(`Composition plugin cannot change current composition run inside 'onExitRun'.`)

            throw runResult.exception
        }
    }

    dispose() {
        this.plugins.forEach(plugin => plugin.onDispose?.())
    }
}
