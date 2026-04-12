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


/**
 * Composer должен иметь плагин [StateReadsPlugin].
 */
export class Recomposer implements StateReadsObserver {
    private stateConsumers = new Map<State<unknown>, Set<Node>>()
    private nodeDependencies = new Map<Node, Set<State<unknown>>>()
    private observers = new Map<State<unknown>, Disposable>()

    private nodesToRecompose = new Set<Node>()

    needRecompose() {
        return this.nodesToRecompose.size > 0
    }

    recompose(composer: Composer) {
        if (!this.needRecompose())
            return

        const nodesToRecompose = new Set(this.nodesToRecompose)
        this.nodesToRecompose.clear()
        nodesToRecompose.forEach((node) => {
            if (!isCompositionDirty(node))
                return
            const recomposeLambda = node.extensions.get(RecomposeLambdaExtensionKey) as RecomposeLambda | undefined
            if (recomposeLambda === undefined)
                return

            setCurrentComposer(composer)
            composer.startRootNode(node)
            composer.startComposingNode()
            const oldComposer = currentComposerOrNull()
            debug.log(`Recompose ${node.findName() ?? ''}`)
            recomposeLambda()
            composer.endComposingNode()
            composer.endRootNode()
            setCurrentComposer(oldComposer)
        })
    }

    onStateRead(node: Node, state: State<unknown>): void {
        this.addDependency(node, state)
        this.observeIfNotObservedYet(state)
    }

    onStatesChanged(node: Node, states: StateReads): void {
        this.clearNodeDependencies(node)
        if (states.size === 0)
            return

        this.setNodeDependencies(node, states)

        const deletedDependencies = new Set<State<unknown>>(this.nodeDependencies.get(node) ?? [])
        states.forEach(newDependency => deletedDependencies.delete(newDependency))

        // Useless because [onStateRead] already added observer for this state
        // states.forEach(newDependency => this.observeIfNotObservedYet(newDependency))

        deletedDependencies.forEach(deletedDependency => {
            if ((this.stateConsumers.get(deletedDependency)?.size ?? -1) === 0)
                this.deleteObserver(deletedDependency)
        })
    }

    onNodeCleared(node: Node) {
        this.clearNodeDependencies(node)
    }

    ///

    private observeIfNotObservedYet(state: State<unknown>) {
        if (this.observers.has(state)) {
            return
        }

        const observer = GlobalSnapshot.observeStateWrites((writtenState) => {
            if (writtenState !== state)
                return
            const consumers = this.stateConsumers.get(state)
            if (consumers === undefined)
                throw new Error(`Must be unreachable; This state observed but it doesn't have any consumer`)
            for (const consumer of consumers) {
                let currentConsumer = consumer
                while (!currentConsumer.extensions.has(RecomposeLambdaExtensionKey) && currentConsumer.parent !== null) {
                    currentConsumer = currentConsumer.parent
                }
                debug.log(`Invalidate ${currentConsumer.findName() ?? ''}`)
                markCompositionAsDirty(currentConsumer)
                this.nodesToRecompose.add(currentConsumer)
            }
        })

        this.observers.set(state, observer)
    }

    private deleteObserver(state: State<unknown>) {
        this.observers.get(state)?.[Symbol.dispose]()
        this.observers.delete(state)
    }

    ///

    private addDependency(node: Node, dependency: State<unknown>): void {
        let dependencies = this.nodeDependencies.get(node)
        if (dependencies === undefined) {
            dependencies = new Set()
            this.nodeDependencies.set(node, dependencies)
        }
        dependencies.add(dependency)

        let consumers = this.stateConsumers.get(dependency)
        if (consumers === undefined) {
            consumers = new Set()
            this.stateConsumers.set(dependency, consumers)
        }
        consumers.add(node)
    }

    private clearNodeDependencies(node: Node) {
        const dependencies = this.nodeDependencies.get(node)
        if (dependencies === undefined)
            return
        this.nodeDependencies.delete(node)

        dependencies.forEach(dependency => {
            const consumers = this.stateConsumers.get(dependency)!
            consumers.delete(node)
            if (consumers.size === 0)
                this.stateConsumers.delete(dependency)
        })
    }

    private setNodeDependencies(node: Node, dependencies: Set<State<unknown>>): void {
        this.nodeDependencies.set(node, dependencies)

        dependencies.forEach(dependency => {
            let consumers = this.stateConsumers.get(dependency)
            if (consumers === undefined) {
                consumers = new Set()
                this.stateConsumers.set(dependency, consumers)
            }
            consumers.add(node)
        })
    }
}
