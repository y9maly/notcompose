import type { CompositionRun } from './CompositionRun.js'

/**
 * [onExitRun] гарантированно вызывается с exitedRun === newRun после [onEnterRun]
 * [onReenter] вызывается после [onLeave], не обязательно с тем же [currentRun], но в базовом случае - с ним.
 * [dispose] вызывается в любой момент
 */
export interface CompositionPlugin {
    onEnterRun?(previousRun: CompositionRun | null, newRun: CompositionRun): void

    onLeave?(currentRun: CompositionRun): void

    onReenter?(currentRun: CompositionRun): void

    onExitRun?(
        exitedRun: CompositionRun,
        restoredRun: CompositionRun | null,
        exitedRunResult: { completedExceptionally: false } | { completedExceptionally: true, exception: unknown }
    ): void

    onDispose?(): void
}
