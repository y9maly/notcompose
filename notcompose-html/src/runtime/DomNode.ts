import type { ListenerModifier } from './modifiers/ListenerModifier.js'

/**
 * Either DomTextNode or DomElementNode
 */
export class DomNode<NODE extends Node> {
    constructor(public readonly domNode: NODE) {}
}

export class DomNodeText extends DomNode<Text> {
    constructor(text: Text) { super(text) }
}

export class DomNodeElement extends DomNode<Element> {
    constructor(element: Element) { super(element) }

    private currentEventListeners: ListenerModifier[] = []

    updateEventListeners(eventListeners: ListenerModifier[]) {
        this.currentEventListeners.forEach(listener => {
            this.domNode.removeEventListener(listener.type, listener.listener, listener.options)
        })
        this.currentEventListeners = eventListeners
        this.currentEventListeners.forEach(listener => {
            this.domNode.addEventListener(listener.type, listener.listener, listener.options)
        })
    }

    updateProperties() {

    }
}
