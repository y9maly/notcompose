import type { ComposerPlugin } from '../../composer/ComposerPlugin.js'
import { Node } from '../../runtime/Node.js'
import { unmarkCompositionAsDirty } from './DirtyCompositionMarker.js'

export class CleanCompositionPlugin implements ComposerPlugin {
    onNodeCompositionStarted(node: Node) {
        unmarkCompositionAsDirty(node)
    }
}
