import {Composer} from "./Composer";
import {Node} from "./Node";


export interface ComposerPluginContext {
    composer: Composer

    currentCompositionRootNode(): Node | null
}
