import {
    CleanCompositionPlugin,
    Composer,
    PluginVerifierPlugin,
    Recomposer,
    RememberObserverPlugin,
    StateReadsPlugin
} from "notcompose";
import {HtmlComposition} from "./Composition.js";
import {DomCommitPlugin} from "./runtime/DomCommitPlugin.js";

export interface HtmlCompositionController {
    flush(): void
    dispose(): void
}

export function bootstrapHtmlComposition(root: Element): {
    readonly composer: Composer
    readonly recomposer: Recomposer
    readonly composition: HtmlComposition
    start(): HtmlCompositionController
} {
    const recomposer = new Recomposer()
    const composer = new Composer([
        recomposer,
        new PluginVerifierPlugin(),
        new CleanCompositionPlugin(),
        new StateReadsPlugin(recomposer),
        new RememberObserverPlugin(),
        new DomCommitPlugin(),
    ])
    const composition = new HtmlComposition(composer, root)

    let started = false
    let disposed = false

    const flush = (): void => {
        if (disposed)
            return

        if (recomposer.needRecompose())
            recomposer.recompose(composer)
        if (recomposer.needRecompose())
            recomposer.recompose(composer)
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
