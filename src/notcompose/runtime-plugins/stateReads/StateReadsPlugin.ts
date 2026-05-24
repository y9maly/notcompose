import {PartialComposerPlugin} from "../../runtime/ComposerPlugin";
import {Node} from "../../runtime/Node";
import {GlobalSnapshot} from "../../runtime/Snapshot";
import {ComposerPluginContext} from "../../runtime/ComposerPluginContext";
import {Composer} from "../../runtime/Composer";
import {StateReadsObserver} from "./StateReadsObserver";
import {StateReadsCollector} from "./StateReadsCollector";

export class StateReadsPlugin implements PartialComposerPlugin {
    constructor(
        private readonly observer?: StateReadsObserver
    ) {}

    private collector = new StateReadsCollector<Node>(
        () => this.composer.currentNode,
        (state, node) => this.observer?.onStateRead(node, state),
    )
    private composer!: Composer

    attach(context: ComposerPluginContext) {
        this.composer = context.composer
    }

    initially() {
        this.collector.start()
    }

    finally() {
        this.collector.stop()
    }

    onNodeForgotten(node: Node) {
        if (!this.observer)
            return

        this.observer.onNodeCleared(node)
        node.walkChildrenDFS(node => {
            this.observer!.onNodeCleared(node)
        })
    }

    exitComposition() {
        this.collector.stop()
    }

    reenterComposition() {
        this.collector.start()
    }

    onNodeCompositionStarted(node: Node) {
        this.collector.initialize(node)
    }

    onNodeCompositionEnded(node: Node) {
        this.observer?.onStatesChanged(node, this.collector.release(node))
    }
}
