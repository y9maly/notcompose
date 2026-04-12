import {currentComposer} from "../runtime/currentComposer.js";
import {Modifier} from "../runtime/Modifier.js";
import {Key} from "../runtime/Composer.js";

export function Key(key: Key, content: () => void) {
    currentComposer().startNode(new Modifier(), key)
    currentComposer().startComposingNode()
    content()
    currentComposer().endComposingNode()
    currentComposer().endNode()
}
