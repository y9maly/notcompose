import { type ComposerPlugin, type ModifierElement, Node as CompositionNode } from 'notcompose'
import { type DomElementState, type DomNodeState, domNodeStateOf, isDomContainerState } from './DomNodeState.js'
import { AttributeModifier } from './modifiers/AttributeModifier.js'
import { StyleModifier } from './modifiers/StyleModifier.js'
import { ListenerModifier } from './modifiers/ListenerModifier.js'
import { PropertyModifier } from './modifiers/PropertyModifier.js'
import { type DomRef, RefModifier } from './modifiers/RefModifier.js'

export class DomCommitPlugin implements ComposerPlugin {
    private readonly dirtyNodes = new Set<CompositionNode>()
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

        this.dirtyNodes.add(node)
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
            this.dirtyNodes.delete(forgottenNode)
            this.dirtyContainers.delete(forgottenNode)
            cleanupDomState(state)
        })
    }

    finally() {
        const pendingRefs: DomElementState[] = []

        this.dirtyNodes.forEach(node => {
            const state = domNodeStateOf(node)
            if (state === null)
                return

            if (state.kind === 'element') {
                commitElement(node, state, pendingRefs)
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

        this.dirtyNodes.clear()
        this.dirtyContainers.clear()
    }

    dispose() {
        this.roots.forEach(root => {
            root.children.forEach(({ node }) => node.walkDFS(child => {
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

        this.dirtyNodes.clear()
        this.dirtyContainers.clear()
        this.roots.clear()
    }
}

function commitText(state: Extract<DomNodeState, { kind: 'text' }>) {
    if (state.committedData === state.desiredData)
        return
    state.node.data = state.desiredData
    state.committedData = state.desiredData
}

function commitElement(
    compositionNode: CompositionNode,
    state: DomElementState,
    pendingRefs: DomElementState[],
) {
    const modifiers = compositionNode.modifier.elements
    const desiredAttributes = collectAttributes(modifiers)

    state.committedAttributes.forEach((_, name) => {
        if (!desiredAttributes.has(name))
            state.node.removeAttribute(name)
    })
    desiredAttributes.forEach((value, name) => {
        if (state.committedAttributes.get(name) !== value)
            state.node.setAttribute(name, value)
    })
    state.committedAttributes = desiredAttributes

    const desiredStyles = collectStyles(modifiers)
    const style = inlineStyleOf(state.node)
    if (style !== null) {
        state.committedStyles.forEach((_, name) => {
            if (!desiredStyles.has(name))
                style.removeProperty(name)
        })
        desiredStyles.forEach((value, name) => {
            if (state.committedStyles.get(name) !== value)
                style.setProperty(name, value)
        })
    }
    state.committedStyles = desiredStyles

    state.installedListeners.forEach(listener => {
        state.node.removeEventListener(listener.type, listener.listener, listener.options)
    })
    state.installedListeners = collectListeners(modifiers)
    state.installedListeners.forEach(listener => {
        state.node.addEventListener(listener.type, listener.listener, listener.options)
    })

    modifiers.forEach(modifier => {
        if (modifier instanceof PropertyModifier)
            modifier.update(state.node)
    })

    const desiredRef = collectRef(modifiers)
    if (state.activeRef !== null && desiredRef === null) {
        state.refCleanup?.()
        state.refCleanup = null
        state.activeRef = null
    } else if (state.activeRef === null && desiredRef !== null) {
        state.activeRef = desiredRef
        pendingRefs.push(state)
    }
}

function collectAttributes(modifiers: ReadonlyArray<ModifierElement>): Map<string, string> {
    const attributes = new Map<string, string>()

    modifiers.forEach(modifier => {
        if (!(modifier instanceof AttributeModifier))
            return

        if (modifier.value === null || modifier.value === undefined || modifier.value === false) {
            attributes.delete(modifier.name)
        } else {
            attributes.set(modifier.name, modifier.value === true ? '' : String(modifier.value))
        }
    })

    return attributes
}

function collectStyles(modifiers: ReadonlyArray<ModifierElement>): Map<string, string> {
    const styles = new Map<string, string>()

    modifiers.forEach(modifier => {
        if (!(modifier instanceof StyleModifier))
            return

        const propertyName = cssPropertyName(modifier.name)
        if (modifier.value === null || modifier.value === undefined) {
            styles.delete(propertyName)
        } else {
            styles.set(propertyName, String(modifier.value))
        }
    })

    return styles
}

function collectListeners(modifiers: ReadonlyArray<ModifierElement>): ListenerModifier[] {
    let needCombineSameListeners = false
    const uniqueListeners = new Map<string, ListenerModifier[]>()

    modifiers.forEach(modifier => {
        if (!(modifier instanceof ListenerModifier))
            return

        const capture = typeof modifier.options === 'boolean'
            ? modifier.options
            : modifier.options?.capture ?? false
        const key = `${modifier.type}:${capture}`
        const list = uniqueListeners.get(key)
        if (list) {
            needCombineSameListeners = true
            list.push(modifier)
        } else {
            uniqueListeners.set(key, [modifier])
        }
    })

    if (!needCombineSameListeners)
        return modifiers.filter(it => it instanceof ListenerModifier)

    return [...uniqueListeners.values().map((listeners) => {
        const firstListener = listeners[0]
        if (listeners.length === 1)
            return firstListener
        return new ListenerModifier(firstListener.type, (evt) => {
            for (const listener of listeners) {
                listener.listener(evt)
            }
        }, firstListener.options)
    })]
}

function collectRef(modifiers: ReadonlyArray<ModifierElement>): DomRef<Element> | null {
    let ref: DomRef<Element> | null = null
    modifiers.forEach(modifier => {
        if (modifier instanceof RefModifier)
            ref = modifier.effect as DomRef<Element>
    })
    return ref
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
        state.node.removeChild(state.node.childNodes.item(state.node.childNodes.length - 1))
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
    return (element as Element & { style: CSSStyleDeclaration }).style
}

function cssPropertyName(name: string): string {
    if (name.startsWith('--') || name.includes('-'))
        return name
    return name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
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
