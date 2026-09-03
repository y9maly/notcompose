import { Composer } from './Composer.js'
import { Node } from './Node.js'

export interface ComposerPluginContext {
    composer: Composer

    currentCompositionRootNode(): Node | null
}
