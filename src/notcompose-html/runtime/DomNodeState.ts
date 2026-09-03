import { Node as CompositionNode, NodeExtensionKey } from 'notcompose'
import { ListenerModifier } from './modifiers/ListenerModifier.js'
import type { DomRef } from './modifiers/RefModifier.js'

export const DomNodeExtensionKey = new NodeExtensionKey<DomNodeState>('DomNode')

interface DomContainerState {
    committedChildren: globalThis.Node[]
}

export interface DomRootState extends DomContainerState {
    readonly kind: 'root'
    readonly node: Element
}

export interface DomElementState extends DomContainerState {
    readonly kind: 'element'
    readonly node: Element
    readonly tagName: string

    committedAttributes: Map<string, string>
    committedStyles: Map<string, string>
    installedListeners: ListenerModifier[]

    activeRef: DomRef<Element> | null
    refCleanup: (() => void) | null
}

export interface DomTextState {
    readonly kind: 'text'
    readonly node: Text
    desiredData: string
    committedData: string
}

export type DomNodeState = DomRootState | DomElementState | DomTextState

export function createDomRootState(node: Element): DomRootState {
    return {
        kind: 'root',
        node,
        committedChildren: [],
    }
}

export function createDomElementState(node: Element, tagName: string): DomElementState {
    return {
        kind: 'element',
        node,
        tagName,
        committedAttributes: new Map(),
        committedStyles: new Map(),
        installedListeners: [],
        committedChildren: [],
        activeRef: null,
        refCleanup: null,
    }
}

export function createDomTextState(node: Text): DomTextState {
    return {
        kind: 'text',
        node,
        desiredData: '',
        committedData: '',
    }
}

export function domNodeStateOf(node: CompositionNode): DomNodeState | null {
    return node.getExtension(DomNodeExtensionKey) ?? null
}

export function isDomContainerState(state: DomNodeState): state is DomRootState | DomElementState {
    return state.kind === 'root' || state.kind === 'element'
}
