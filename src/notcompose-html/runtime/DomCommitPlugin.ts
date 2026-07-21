import {ComposerPlugin, Node as CompositionNode} from "notcompose";
import {
    DomElementState,
    DomNodeState,
    DomRootState,
    domNodeStateOf,
    isDomContainerState
} from "./DomNodeState.js";

export class DomCommitPlugin implements ComposerPlugin {
    private readonly dirtyStates = new Set<DomNodeState>()
    private readonly dirtyContainers = new Set<CompositionNode>()
    private readonly roots = new Set<CompositionNode>()

    onStartTree(treeRoot: CompositionNode) {
        const state = domNodeStateOf(treeRoot)
        if (treeRoot.parent === null && state?.kind === 'root')
            this.roots.add(treeRoot)
    }

    onNodeCompositionEnded(node: CompositionNode) {
        const state = domNodeStateOf(node)
        if (state === null) {
            const container = nearestDomContainer(node.parent)
            if (container !== null)
                this.dirtyContainers.add(container)
            return
        }

        this.dirtyStates.add(state)
        if (isDomContainerState(state))
            this.dirtyContainers.add(node)
    }

    onNodeForgotten(node: CompositionNode) {
        const container = nearestDomContainer(node.parent)
        if (container !== null)
            this.dirtyContainers.add(container)

        node.walkDFS(forgottenNode => {
            const state = domNodeStateOf(forgottenNode)
            if (state === null)
                return
            this.dirtyStates.delete(state)
            this.dirtyContainers.delete(forgottenNode)
            cleanupDomState(state)
        })
    }

    finally() {
        const pendingRefs: DomElementState[] = []

        this.dirtyStates.forEach(state => {
            if (state.kind === 'element') {
                commitElement(state, pendingRefs)
            } else if (state.kind === 'text') {
                commitText(state)
            }
        })

        const containers = [...this.dirtyContainers]
            .sort((a, b) => nodeDepth(b) - nodeDepth(a))
        containers.forEach(reconcileDomChildren)

        pendingRefs.forEach(state => {
            const ref = state.activeRef
            if (ref === null)
                return
            state.refCleanup = ref(state.node) ?? null
        })

        this.dirtyStates.clear()
        this.dirtyContainers.clear()
    }

    dispose() {
        this.roots.forEach(root => {
            root.children.forEach(({node}) => node.walkDFS(child => {
                const state = domNodeStateOf(child)
                if (state !== null)
                    cleanupDomState(state)
            }))

            const rootState = domNodeStateOf(root)
            if (rootState?.kind === 'root') {
                rootState.node.replaceChildren()
                rootState.committedChildren = []
            }
        })

        this.dirtyStates.clear()
        this.dirtyContainers.clear()
        this.roots.clear()
    }
}

function commitText(state: Extract<DomNodeState, {kind: 'text'}>) {
    if (state.committedData === state.desiredData)
        return
    state.node.data = state.desiredData
    state.committedData = state.desiredData
}

function commitElement(state: DomElementState, pendingRefs: DomElementState[]) {
    const desired = state.desiredAttributes

    state.committedAttributes.forEach((_, name) => {
        if (!desired.attributes.has(name))
            state.node.removeAttribute(name)
    })
    desired.attributes.forEach((value, name) => {
        if (state.committedAttributes.get(name) !== value)
            state.node.setAttribute(name, value)
    })
    state.committedAttributes = new Map(desired.attributes)

    const style = inlineStyleOf(state.node)
    if (style !== null) {
        state.committedStyles.forEach((_, name) => {
            if (!desired.styles.has(name))
                style.removeProperty(name)
        })
        desired.styles.forEach((value, name) => {
            if (state.committedStyles.get(name) !== value)
                style.setProperty(name, value)
        })
    }
    state.committedStyles = new Map(desired.styles)

    state.installedListeners.forEach(listener => {
        state.node.removeEventListener(listener.type, listener.listener, listener.options)
    })
    state.installedListeners = [...desired.listeners.values()]
    state.installedListeners.forEach(listener => {
        state.node.addEventListener(listener.type, listener.listener, listener.options)
    })

    desired.propertyUpdates.forEach(update => update(state.node))

    if (state.activeRef !== null && desired.ref === null) {
        state.refCleanup?.()
        state.refCleanup = null
        state.activeRef = null
    } else if (state.activeRef === null && desired.ref !== null) {
        state.activeRef = desired.ref
        pendingRefs.push(state)
    }
}

function reconcileDomChildren(node: CompositionNode) {
    const state = domNodeStateOf(node)
    if (state === null || !isDomContainerState(state))
        return

    const desiredChildren = collectDirectDomChildren(node)
    if (arraysEqual(state.committedChildren, desiredChildren))
        return

    for (let index = 0; index < desiredChildren.length; index++) {
        const expected = desiredChildren[index]
        const current = state.node.childNodes.item(index)
        if (current !== expected)
            state.node.insertBefore(expected, current)
    }

    while (state.node.childNodes.length > desiredChildren.length) {
        state.node.removeChild(state.node.childNodes.item(state.node.childNodes.length - 1)!)
    }

    state.committedChildren = desiredChildren
}

function collectDirectDomChildren(node: CompositionNode): globalThis.Node[] {
    const result: globalThis.Node[] = []
    const queue = node.children.map(it => it.node)

    while (queue.length > 0) {
        const child = queue.shift()!
        const state = domNodeStateOf(child)
        if (state === null) {
            queue.unshift(...child.children.map(it => it.node))
        } else if (state.kind !== 'root') {
            result.push(state.node)
        }
    }

    return result
}

function nearestDomContainer(node: CompositionNode | null): CompositionNode | null {
    let current = node
    while (current !== null) {
        const state = domNodeStateOf(current)
        if (state !== null && isDomContainerState(state))
            return current
        current = current.parent
    }
    return null
}

function cleanupDomState(state: DomNodeState) {
    if (state.kind !== 'element')
        return

    state.installedListeners.forEach(listener => {
        state.node.removeEventListener(listener.type, listener.listener, listener.options)
    })
    state.installedListeners = []

    state.refCleanup?.()
    state.refCleanup = null
    state.activeRef = null
}

function inlineStyleOf(element: Element): CSSStyleDeclaration | null {
    if (!('style' in element))
        return null
    return (element as Element & {style: CSSStyleDeclaration}).style
}

function arraysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index])
}

function nodeDepth(node: CompositionNode): number {
    let depth = 0
    let current = node.parent
    while (current !== null) {
        depth++
        current = current.parent
    }
    return depth
}
