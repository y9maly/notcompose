import {currentComposer} from "../runtime/currentComposer.js";
import {Modifier} from "../runtime/Modifier.js";
import {Key} from "../runtime/Composer.js";
import {RecomposeLambdaExtensionKey} from "../runtime-plugins/partialRecomposition/RecomposeLambda";

export function Key<T>(key: Key, content: () => T): T {
    currentComposer().startNode(new Modifier(), key)
    currentComposer().applyExtension(RecomposeLambdaExtensionKey, content)
    currentComposer().startComposingNode()
    const value = content()
    currentComposer().endComposingNode()
    currentComposer().endNode()
    return value
}
