import { currentRecomputeScopeOrNull, setCurrentRecomputeScopeUnsafe } from '../recomputation/currentRecomputeScope.js'
import type { RecomputeScope } from '../recomputation/RecomputeScope.js'
import type { CompositionPlugin } from '../composition/CompositionPlugin.js'
import type { CompositionRun } from '../composition/CompositionRun.js'

export class RecomputeScopeApplierPlugin implements CompositionPlugin {
    private readonly associatedRecomputeScopes = new Map<CompositionRun | null, RecomputeScope | null>()

    constructor(
        private readonly recomputeScope: RecomputeScope,
    ) {}

    onEnterRun(previousRun: CompositionRun | null, newRun: CompositionRun) {
        this.associatedRecomputeScopes.set(previousRun, currentRecomputeScopeOrNull())
        setCurrentRecomputeScopeUnsafe(this.recomputeScope)
    }

    onLeave(currentRun: CompositionRun) {
        const associatedRecomputeScope = currentRecomputeScopeOrNull()
        this.associatedRecomputeScopes.set(currentRun, associatedRecomputeScope)
        associatedRecomputeScope?.leaveRecomputeScope()
        setCurrentRecomputeScopeUnsafe(null)
    }

    onReenter(currentRun: CompositionRun) {
        const associatedRecomputeScope = this.associatedRecomputeScopes.get(currentRun)
        if (associatedRecomputeScope === undefined)
            throw new Error(`Must be unreachable: onReenter cannot be invoked before onLeave (currentRun=${JSON.stringify(currentRun)})`)
        this.associatedRecomputeScopes.delete(currentRun)
        setCurrentRecomputeScopeUnsafe(associatedRecomputeScope)
        associatedRecomputeScope?.reenterRecomputeScope()
    }

    onExitRun(
        exitedRun: CompositionRun,
        restoredRun: CompositionRun | null,
        exitedRunResult: { completedExceptionally: false } | { completedExceptionally: true; exception: unknown }
    ) {
        const associatedRecomputeScope = this.associatedRecomputeScopes.get(restoredRun)
        if (associatedRecomputeScope === undefined)
            throw new Error(`Must be unreachable: onExitRun cannot be invoked before onEnterRun (exitedRun=${JSON.stringify(exitedRun)}, restoredRun=${JSON.stringify(restoredRun)}, exitedRunResult=${JSON.stringify(exitedRunResult)})`)
        this.associatedRecomputeScopes.delete(restoredRun)
        setCurrentRecomputeScopeUnsafe(associatedRecomputeScope)
    }

    onDispose() {
        const associatedRecomputeScope = this.associatedRecomputeScopes.get(null)
        if (associatedRecomputeScope === undefined)
            return
        this.associatedRecomputeScopes.delete(null)
        setCurrentRecomputeScopeUnsafe(associatedRecomputeScope)
    }
}
