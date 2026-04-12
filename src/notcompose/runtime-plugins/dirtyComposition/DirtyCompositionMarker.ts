import {Node} from "../../runtime/Node";


const DirtyCompositionMarker = Symbol('DirtyCompositionMarker')


export function isCompositionDirty(node: Node): boolean {
    return node.extensions.get(DirtyCompositionMarker) === true
}

export function markCompositionAsDirty(node: Node) {
    node.extensions.set(DirtyCompositionMarker, true)
}

export function unmarkCompositionAsDirty(node: Node) {
    node.extensions.delete(DirtyCompositionMarker)
}
