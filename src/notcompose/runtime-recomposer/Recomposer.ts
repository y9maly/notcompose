import {StateReadsObserver} from "../runtime-plugins/stateReads/StateReadsObserver";
import {Node} from "../runtime/Node";
import {State} from "../runtime/State";
import {StateReads} from "../runtime-plugins/stateReads/StateReads";
import {GlobalSnapshot} from "../runtime/Snapshot";
import {isCompositionDirty, markCompositionAsDirty} from "../runtime-plugins/dirtyComposition/DirtyCompositionMarker";
import {RecomposeLambda, RecomposeLambdaExtensionKey} from "../runtime-plugins/partialRecomposition/RecomposeLambda";
import {Composer} from "../runtime/Composer";
import {currentComposerOrNull, setCurrentComposer} from "../runtime/currentComposer";
import {debug} from "../runtime/debug";
import {StateDependenciesMap} from "./StateDependenciesMap";


/**
 * Composer должен иметь плагин [StateReadsPlugin].
 */
export class Recomposer implements StateReadsObserver {
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

    recompose(composer: Composer) {
        if (!this.needRecompose())
            return

        const nodesToRecompose = new Set(this.stateDependenciesMap.dirtyObjects)
        this.stateDependenciesMap.dirtyObjects.clear()
        nodesToRecompose.forEach((node) => {
            if (!isCompositionDirty(node))
                return
            const recomposeLambda = node.extensions.get(RecomposeLambdaExtensionKey) as RecomposeLambda | undefined
            if (recomposeLambda === undefined)
                return

            const oldComposer = currentComposerOrNull()
            setCurrentComposer(composer)
            composer.startRootNode(node)
            composer.startComposingNode()
            debug.log(`Recompose ${node.findName() ?? ''}`)
            recomposeLambda()
            composer.endComposingNode()
            composer.endRootNode()
            setCurrentComposer(oldComposer)
        })

        if (this.stateDependenciesMap.dirtyObjects.size === 0) {
            this.awaitNeedRecomposePromise = new Promise<void>((it => this.awaitNeedRecomposePromiseResolve = it))
        } else {
            this.awaitNeedRecomposePromise = Promise.resolve()
        }
    }

    onStateRead(node: Node, state: State<unknown>): void {
        this.stateDependenciesMap.onStateRead(node, state)
    }

    onStatesChanged(node: Node, states: StateReads): void {
        this.stateDependenciesMap.onStatesChanged(node, states)
    }

    onNodeCleared(node: Node) {
        this.stateDependenciesMap.forget(node)
    }
}
