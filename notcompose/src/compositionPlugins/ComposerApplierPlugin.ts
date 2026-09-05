import type { CompositionPlugin } from '../composition/CompositionPlugin.js'
import type { CompositionRun } from '../composition/CompositionRun.js'
import { currentComposerOrNull, setCurrentComposerUnsafe } from '../composer/currentComposer.js'
import type { Composer } from '../composer/Composer.js'

export class ComposerApplierPlugin implements CompositionPlugin {
    private outsideCompositionRunComposer: Composer | null = null

    onEnterRun(previousRun: CompositionRun | null, newRun: CompositionRun) {
        if (previousRun === null)
            this.outsideCompositionRunComposer = currentComposerOrNull()
        setCurrentComposerUnsafe(newRun.session.composer)
    }

    onExitRun(
        exitedRun: CompositionRun,
        restoredRun: CompositionRun | null,
        exitedRunResult: { completedExceptionally: false } | { completedExceptionally: true; exception: unknown }
    ) {
        if (restoredRun !== null) {
            setCurrentComposerUnsafe(restoredRun.session.composer)
        } else {
            setCurrentComposerUnsafe(this.outsideCompositionRunComposer)
            this.outsideCompositionRunComposer = null
        }
    }
}
