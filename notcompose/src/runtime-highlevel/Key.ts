import { currentComposer } from '../composer/currentComposer.js'
import { Modifier } from '../runtime/Modifier.js'
import type { Key as ComposerKey } from '../composer/Composer.js'
import { RecomposeLambdaExtensionKey } from '../composerPlugins/partialRecomposition/RecomposeLambda.js'

export function Key<T>(key: ComposerKey, content: () => T): T {
    currentComposer().startNode(Modifier, key)
    currentComposer().applyExtension(RecomposeLambdaExtensionKey, content)
    currentComposer().startComposingNode()
    const value = content()
    currentComposer().endComposingNode()
    currentComposer().endNode()
    return value
}

Key.start = (key: ComposerKey, recompose?: () => void) => {
    currentComposer().startNode(Modifier, key)
    if (recompose)
        currentComposer().applyExtension(RecomposeLambdaExtensionKey, recompose)
    currentComposer().startComposingNode()
}

Key.end = () => {
    currentComposer().endComposingNode()
    currentComposer().endNode()
}
