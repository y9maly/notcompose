import type { CompositionRun } from './CompositionRun.js'

/**
 * [onExitRun] гарантированно вызывается с exitedRun === newRun после [onEnterRun]
 */
export interface CompositionPlugin {
    onEnterRun?(previousRun: CompositionRun | null, newRun: CompositionRun): void

    onExitRun?(
        exitedRun: CompositionRun,
        restoredRun: CompositionRun | null,
        exitedRunResult: { completedExceptionally: false } | { completedExceptionally: true, exception: unknown }
    ): void

    onDispose?(): void
}
