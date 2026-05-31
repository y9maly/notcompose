import {ComposerPlugin} from "../../runtime/ComposerPlugin";
import {Node} from "../../runtime/Node";
import {unmarkCompositionAsDirty} from "./DirtyCompositionMarker";

export class CleanCompositionPlugin implements ComposerPlugin {
    onNodeCompositionStarted(node: Node) {
        unmarkCompositionAsDirty(node)
    }
}
