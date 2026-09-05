import type { ComposerPlugin } from '../../composer/ComposerPlugin.js'
import { Node } from '../../runtime/Node.js'
import type { ComposerPluginContext } from '../../composer/ComposerPluginContext.js'
import { Composer } from '../../composer/Composer.js'
import type { StateReadsObserver } from './StateReadsObserver.js'
import { StateReadsCollector } from './StateReadsCollector.js'

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
