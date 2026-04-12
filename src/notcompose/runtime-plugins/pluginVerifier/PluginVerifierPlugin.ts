import {PartialComposerPlugin} from "../../runtime/ComposerPlugin";
import {ComposerPluginContext} from "../../runtime/ComposerPluginContext";
import {Node} from "../../runtime/Node";
import {Composer} from "../../runtime/Composer";


export class PluginVerifierPlugin implements PartialComposerPlugin {
    private context!: ComposerPluginContext
    private composer!: Composer

    attach(context: ComposerPluginContext): void {
        this.context = context
        this.composer = context.composer
    }

    private rootNodes: Node[] = []
    private get rootNodesCount() { return this.rootNodes.length }
    private exitedComposition = false
    private initiallyCalled = false

    initially() {
        if (this.initiallyCalled)
            error(`unexpected 'initially' call`)
        this.initiallyCalled = true
    }

    finally() {
        if (!this.initiallyCalled)
            error(`unexpected 'finally' call`)
        this.initiallyCalled = false
    }

    onStartRootNode(node: Node): void {
        this.ensureInitiallyCalled()
        this.ensureInComposition('onStartRootNode')
        this.rootNodes.push(node)
        this.knownNodes.add(node)
        this.onStartNode(node)
    }

    exitComposition(): void {
        this.ensureInitiallyCalled()
        this.ensureInComposition('exitComposition')
        this.exitedComposition = true
    }

    reenterComposition(): void {
        this.ensureInitiallyCalled()
        if (!this.exitedComposition)
            error(`reenterComposition called twice`)
        this.exitedComposition = false
    }

    onEndRootNode(node: Node): void {
        this.ensureInitiallyCalled()
        this.ensureInComposition('onEndRootNode')
        if (this.rootNodesCount === 0)
            error('Unexpected onEndRootNode')
        const expectedNode = this.rootNodes.pop()!
        if (node !== expectedNode)
            error(`Wrong onEndRootNode: expected '${expectedNode}' actual '${node}'`)
    }

    //

    private knownNodes = new Set<Node>()

    onNodeCreated(node: Node): void {
        this.ensureInitiallyCalled()
        if (this.knownNodes.has(node))
            error(`onNodeCreated called twice on ${node}`)
        this.knownNodes.add(node)
    }

    onNodeInserted(node: Node): void {
        this.ensureInitiallyCalled()
        this.knownNodes.add(node)
        this.startedNodes.push(node)
    }

    onNodeForgotten(node: Node): void {
        this.ensureInitiallyCalled()
        if (!this.knownNodes.has(node))
            error(`onNodeForgotten called but onNodeCreated was not called for ${node}`)
        this.knownNodes.delete(node)
    }

    //

    private startedNodes: Node[] = []

    onStartNode(node: Node): void {
        if (this.rootNodes.length === 0)
            error(`onStartNode called before onStartRootNode`)
        if (!this.knownNodes.has(node))
            error(`onStartNode called but onNodeCreated was not called for ${node}`)
        this.startedNodes.push(node)
    }

    onEndNode(node: Node): void {
        if (!this.knownNodes.has(node))
            error(`onStartNode called but onNodeCreated was not called for ${node}`)
        if (this.startedNodes.length === 0)
            error('Unexpected onEndNode')
        const expectedNode = this.startedNodes.pop()!
        if (node !== expectedNode)
            error(`Wrong onEndNode: expected '${expectedNode}' actual '${node}'`)
    }

    //

    private startedCompositionNodes: Node[] = []

    onNodeCompositionStarted(node: Node): void {
        if (!this.knownNodes.has(node))
            error(`onNodeCompositionStarted called but onNodeCreated was not called for ${node}`)
        this.startedCompositionNodes.push(node)
    }

    onNodeCompositionEnded(node: Node): void {
        if (!this.knownNodes.has(node))
            error(`onNodeCompositionEnded called but onNodeCreated was not called for ${node}`)
        if (this.startedCompositionNodes.length === 0)
            error('Unexpected onNodeCompositionEnded')
        const expectedNode = this.startedCompositionNodes.pop()!
        if (node !== expectedNode)
            error(`Wrong onNodeCompositionEnded: expected '${expectedNode}' actual '${node}'`)
    }

    //

    private ensureInComposition(whatCalled: string) {
        if (this.exitedComposition)
            error(`${whatCalled} called when exited composition`)
    }

    private ensureInitiallyCalled() {
        if (!this.initiallyCalled)
            error(`initially was not called`)
    }
}

function error(message: string): never {
    throw new Error(message)
}
