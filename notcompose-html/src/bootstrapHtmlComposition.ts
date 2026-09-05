import { CleanCompositionPlugin, Composer, ComposerApplierPlugin, ComposerVerifierPlugin, CompositionSessionDefault, CurrentComposerRecomputeScope, Recomposer, RecomputeScopeApplierPlugin, RememberObserverPlugin, StateReadsPlugin } from '@notcompose/core'
import { HtmlCompositionRunner } from './Composition.js'
import { DomCommitPlugin } from './runtime/DomCommitPlugin.js'

export interface HtmlCompositionController {
    flush(): void
    dispose(): void
}

export function bootstrapHtmlComposition(root: Element): {
    readonly composer: Composer
    readonly recomposer: Recomposer
    readonly composition: HtmlCompositionRunner
    start(): HtmlCompositionController
} {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        new ComposerVerifierPlugin(),
        new CleanCompositionPlugin(),
        new StateReadsPlugin(recomposer),
        new RememberObserverPlugin(),
        new DomCommitPlugin(),
    ])

    const compositionSession = new CompositionSessionDefault(composer, [
        new RecomputeScopeApplierPlugin(CurrentComposerRecomputeScope),
        new ComposerApplierPlugin(),
    ])

    const composition = new HtmlCompositionRunner(compositionSession, root)

    let started = false
    let disposed = false

    const flush = (): void => {
        if (disposed)
            return

        if (recomposer.needRecompose())
            recomposer.recompose(compositionSession)
        if (recomposer.needRecompose())
            recomposer.recompose(compositionSession)
    }

    const dispose = () => {
        if (disposed)
            return
        disposed = true
        composer.dispose()
    }

    const runScheduler = async () => {
        while (!disposed) {
            await recomposer.awaitNeedRecompose()
            if (disposed)
                return
            flush()
        }
    }

    const start = (): HtmlCompositionController => {
        if (started)
            throw new Error('HTML composition cannot be started twice')
        started = true

        root.replaceChildren()
        composition.compose()
        void runScheduler()

        return {flush, dispose}
    }

    return {
        composer,
        recomposer,
        composition,
        start,
    }
}
