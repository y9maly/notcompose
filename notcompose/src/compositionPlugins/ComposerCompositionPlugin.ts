import type { CompositionPlugin } from '../composition/CompositionPlugin.js'
import type { CompositionRun } from '../composition/CompositionRun.js'
import { currentComposerOrNull, setCurrentComposerUnsafe } from '../composer/currentComposer.js'
import type { Composer } from '../composer/Composer.js'

export class ComposerCompositionPlugin implements CompositionPlugin {
    private readonly associatedComposers = new Map<CompositionRun | null, Composer | null>()

    constructor(
        private readonly composer: Composer
    ) {}

    onEnterRun(previousRun: CompositionRun | null, newRun: CompositionRun) {
        this.associatedComposers.set(previousRun, currentComposerOrNull())
        setCurrentComposerUnsafe(this.composer)
        this.composer.startTree(newRun.compositionRoot)
        this.composer.startComposingNode()
    }

    onLeave(currentRun: CompositionRun) {
        const associatedComposer = currentComposerOrNull()
        this.associatedComposers.set(currentRun, associatedComposer)
        associatedComposer?.leaveComposition()
        setCurrentComposerUnsafe(null)
    }

    onReenter(currentRun: CompositionRun) {
        const associatedComposer = this.associatedComposers.get(currentRun)
        if (associatedComposer === undefined)
            throw new Error(`Must be unreachable: onReenter cannot be invoked before onLeave (currentRun=${JSON.stringify(currentRun)})`)
        this.associatedComposers.delete(currentRun)
        setCurrentComposerUnsafe(associatedComposer)
        associatedComposer?.reenterComposition()
    }

    onExitRun(
        exitedRun: CompositionRun,
        restoredRun: CompositionRun | null,
        exitedRunResult: { completedExceptionally: false } | { completedExceptionally: true; exception: unknown }
    ) {
        this.composer.endComposingNode()
        this.composer.endTree()

        const associatedComposer = this.associatedComposers.get(restoredRun)
        if (associatedComposer === undefined)
            throw new Error(`Must be unreachable: onExitRun cannot be invoked before onEnterRun (exitedRun=${JSON.stringify(exitedRun)}, restoredRun=${JSON.stringify(restoredRun)}, exitedRunResult=${JSON.stringify(exitedRunResult)})`)
        this.associatedComposers.delete(restoredRun)
        setCurrentComposerUnsafe(associatedComposer)
    }
}
