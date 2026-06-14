import {Node} from "../../runtime/Node.js";
import {NodeExtensionKey} from "../../runtime/NodeExtensionKey.js";

const DirtyCompositionMarker = new NodeExtensionKey('DirtyCompositionMarker')


export function isCompositionDirty(node: Node): boolean {
    return node.getExtension(DirtyCompositionMarker) === true
}

export function markCompositionAsDirty(node: Node) {
    node.setExtension(DirtyCompositionMarker, true)
}

export function unmarkCompositionAsDirty(node: Node) {
    node.deleteExtension(DirtyCompositionMarker)
}
