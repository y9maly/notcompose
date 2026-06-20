import {currentComposer} from "../runtime/currentComposer.js";
import {Modifier} from "../runtime/Modifier.js";
import {Key} from "../runtime/Composer.js";
import {RecomposeLambdaExtensionKey} from "../runtime-plugins/partialRecomposition/RecomposeLambda.js";

export function Key<T>(key: Key, content: () => T): T {
    currentComposer().startNode(Modifier, key)
    currentComposer().applyExtension(RecomposeLambdaExtensionKey, content)
    currentComposer().startComposingNode()
    const value = content()
    currentComposer().endComposingNode()
    currentComposer().endNode()
    return value
}
