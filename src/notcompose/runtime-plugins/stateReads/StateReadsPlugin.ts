import {PartialComposerPlugin} from "../../runtime/ComposerPlugin";
import {Node} from "../../runtime/Node";
import {GlobalSnapshot} from "../../runtime/Snapshot";
import {ComposerPluginContext} from "../../runtime/ComposerPluginContext";
import {Composer} from "../../runtime/Composer";
import {__TemporalStateReads, __TemporalStateReadsExtensionKey, StateReads, StateReadsExtensionKey} from "./StateReads";
import {StateReadsObserver} from "./StateReadsObserver";


export class StateReadsPlugin implements PartialComposerPlugin {
    constructor(
        private observer?: StateReadsObserver
    ) {}

    private disposable: Disposable | null = null
    private composer!: Composer

    attach(context: ComposerPluginContext) {
        this.composer = context.composer
    }

    initially() {
        this.start()
    }

    finally() {
        this.stop()
    }

    onNodeForgotten(node: Node) {
        this.observer?.onNodeCleared(node)
    }

    exitComposition() {
        this.stop()
    }

    reenterComposition() {
        this.start()
    }

    onNodeCompositionStarted(node: Node) {
        this.initTemporal(node)
    }

    onNodeCompositionEnded(node: Node) {
        this.releaseTemporal(node)
    }

    private initTemporal(node: Node) {
        let stateReads = node.extensions.get(__TemporalStateReadsExtensionKey) as StateReads | undefined
        if (stateReads !== undefined)
            throw new Error('initTemporal called twice')
        stateReads = new Set()
        node.extensions.set(__TemporalStateReadsExtensionKey, stateReads)
    }

    private releaseTemporal(node: Node) {
        const finalStateReads = node.extensions.get(__TemporalStateReadsExtensionKey) as __TemporalStateReads | undefined
        if (finalStateReads === undefined)
            throw new Error('Must be unreachable')
        node.extensions.delete(__TemporalStateReadsExtensionKey)
        node.extensions.set(StateReadsExtensionKey, finalStateReads)
        this.observer?.onStatesChanged(node, finalStateReads)
    }

    private start() {
        if (this.disposable !== null)
            throw new Error(`Must be unreachable (start was called twice)`)

        this.disposable = GlobalSnapshot.observeStateReads((state) => {
            const node = this.composer.currentNode
            if (node === null)
                throw new Error('Must be unreachable because observer must be disposed when [finally] called and node cannot be null if [initially] was called and [finally] was not called yet')
            let stateReads = node.extensions.get(__TemporalStateReadsExtensionKey) as StateReads | undefined
            if (stateReads === undefined) return

            if (addToSet(stateReads, state))
                this.observer?.onStateRead(node, state)
        })
    }

    private stop() {
        if (this.disposable === null)
            throw new Error(`Must be unreachable (stop called before start)`)
        this.disposable![Symbol.dispose]()
        this.disposable = null
    }
}

/**
 * @return true if new element was added; false if this element already existed
 */
function addToSet<T>(set: Set<T>, value: T): boolean {
    const oldSize = set.size
    set.add(value)
    const newSize = set.size
    return oldSize !== newSize
}
