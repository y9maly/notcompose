import {StateReadsObserver} from "../runtime-plugins/stateReads/StateReadsObserver";
import {Node} from "../runtime/Node";
import {State} from "../runtime/State";
import {StateReads} from "../runtime-plugins/stateReads/StateReads";
import {isCompositionDirty, markCompositionAsDirty} from "../runtime-plugins/dirtyComposition/DirtyCompositionMarker";
import {RecomposeLambda, RecomposeLambdaExtensionKey} from "../runtime-plugins/partialRecomposition/RecomposeLambda";
import {Composer} from "../runtime/Composer";
import {withComposer} from "../runtime/currentComposer";
import {debug} from "../runtime/debug";
import {StateDependenciesMap} from "./StateDependenciesMap";
import {PartialComposerPlugin} from "../runtime/ComposerPlugin";

/**
 * Composer должен иметь плагин [StateReadsPlugin].
 */
export class Recomposer implements StateReadsObserver, PartialComposerPlugin {
    private awaitNeedRecomposePromiseResolve!: (value: void) => void
    private awaitNeedRecomposePromise = new Promise<void>((it => this.awaitNeedRecomposePromiseResolve = it))

    private stateDependenciesMap = new StateDependenciesMap<Node, Node>(
        (node) => {
            let currentNode = node
            while (!currentNode.extensions.has(RecomposeLambdaExtensionKey) && currentNode.parent !== null) {
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
            const recomposeLambda = node.extensions.get(RecomposeLambdaExtensionKey) as RecomposeLambda | undefined
            if (recomposeLambda === undefined)
                return

            withComposer(composer, () => {
                composer.startRootNode(node)
                composer.startComposingNode()
                debug.log(`Recompose ${node.findName() ?? ''}`)
                recomposeLambda()
                composer.endComposingNode()
                composer.endRootNode()
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

    onNodeCleared(node: Node) {
        this.stateDependenciesMap.forget(node)
        this.stateDependenciesMap.dirtyObjects.delete(node)
    }
}
