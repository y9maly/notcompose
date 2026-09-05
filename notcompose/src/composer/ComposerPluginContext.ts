import { Composer } from './Composer.js'
import { Node } from '../runtime/Node.js'

export interface ComposerPluginContext {
    composer: Composer

    currentCompositionRootNode(): Node | null
}
