import {ComposerPlugin} from "../../runtime/ComposerPlugin.js";
import {Node} from "../../runtime/Node.js";
import {ComposerPluginContext} from "../../runtime/ComposerPluginContext.js";
import {Composer} from "../../runtime/Composer.js";
import {StateReadsObserver} from "./StateReadsObserver.js";
import {StateReadsCollector} from "./StateReadsCollector.js";

export class StateReadsPlugin implements ComposerPlugin {
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
        this.observer.onNodeForgotten(node)
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
