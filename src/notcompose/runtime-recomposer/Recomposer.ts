import type { StateReadsObserver } from '../runtime-plugins/stateReads/StateReadsObserver.js'
import { Node } from '../runtime/Node.js'
import type { State } from '../runtime/State.js'
import type { StateReads } from '../runtime-plugins/stateReads/StateReads.js'
import { isCompositionDirty, markCompositionAsDirty } from '../runtime-plugins/dirtyComposition/DirtyCompositionMarker.js'
import { RecomposeLambdaExtensionKey } from '../runtime-plugins/partialRecomposition/RecomposeLambda.js'
import { Composer } from '../runtime/Composer.js'
import { withComposer } from '../runtime/currentComposer.js'
import { debug } from '../runtime/debug.js'
import { StateDependenciesMap } from './StateDependenciesMap.js'
import type { ComposerPlugin } from '../runtime/ComposerPlugin.js'

/**
 * Composer должен иметь плагин [StateReadsPlugin].
 */
export class Recomposer implements StateReadsObserver, ComposerPlugin {
    private awaitNeedRecomposePromiseResolve!: (value: void) => void
    private awaitNeedRecomposePromise = new Promise<void>((it => this.awaitNeedRecomposePromiseResolve = it))

    private stateDependenciesMap = new StateDependenciesMap<Node, Node>(
        (node) => {
            let currentNode = node
            while (!currentNode.hasExtension(RecomposeLambdaExtensionKey) && currentNode.parent !== null) {
                currentNode = currentNode.parent
            }
            return currentNode
        },
        (node) => {
            debug.log(`Invalidate ${node.findName() ?? ''}`)
            markCompositionAsDirty(node)
            if (this.stateDependenciesMap.dirtyObjects.size === 1) {
                this.awaitNeedRecomposePromiseResolve()
            }
        }
    )

    async awaitNeedRecompose(): Promise<void> {
        await this.awaitNeedRecomposePromise
    }

    needRecompose() {
        return this.stateDependenciesMap.dirtyObjects.size > 0
    }

    private recomposing = false
    recompose(composer: Composer) {
        if (this.recomposing)
            throw new Error('[recompose] cannot be called recursively')
        if (!this.needRecompose())
            return

        try {
            this.recomposing = true
            // if (this.currentStateReadsMap.size !== 0)
            //     throw new Error('Unexpected')
            this.doRecompose(composer)
        } finally {
            // this.currentStateReadsMap.clear()
            this.recomposing = false
        }
    }

    private doRecompose(composer: Composer) {
        const nodesToRecompose = new Set(this.stateDependenciesMap.dirtyObjects)
        this.stateDependenciesMap.dirtyObjects.clear()
        nodesToRecompose.forEach((node) => {
            if (!isCompositionDirty(node))
                return
            const recomposeLambda = node.getExtension(RecomposeLambdaExtensionKey)
            if (recomposeLambda === undefined)
                return

            withComposer(composer, () => {
                composer.startTree(node)
                composer.startComposingNode()
                debug.log(`Recompose ${node.findName() ?? ''}`)
                recomposeLambda()
                composer.endComposingNode()
                composer.endTree()
            })
        })

        if (this.stateDependenciesMap.dirtyObjects.size === 0) {
            this.awaitNeedRecomposePromise = new Promise<void>((it => this.awaitNeedRecomposePromiseResolve = it))
        } else {
            this.awaitNeedRecomposePromise = Promise.resolve()
        }
    }

    onNodeCompositionStarted(node: Node) {
        this.stateDependenciesMap.startNode(node)
    }

    onNodeCompositionEnded(node: Node) {
        this.stateDependenciesMap.endNode(node)
    }

    onStateRead(node: Node, state: State<unknown>): void {
        this.stateDependenciesMap.onStateRead(node, state)
    }

    onStatesChanged(node: Node, states: StateReads): void {
        this.stateDependenciesMap.onStatesChanged(node, states)
    }

    onNodeForgotten(node: Node) {
        this.stateDependenciesMap.forget(node)
        this.stateDependenciesMap.dirtyObjects.delete(node)
        node.walkChildrenDFS(node => {
            this.stateDependenciesMap.forget(node)
            this.stateDependenciesMap.dirtyObjects.delete(node)
        })
    }

    dispose() {
        this.stateDependenciesMap.dispose()
    }
}
