import {PartialComposerPlugin} from "../../runtime/ComposerPlugin";
import {Node} from "../../runtime/Node";
import {unmarkCompositionAsDirty} from "./DirtyCompositionMarker";


export class DirtyCompositionPlugin implements PartialComposerPlugin {
    onNodeCompositionStarted(node: Node) {
        unmarkCompositionAsDirty(node)
    }
}
