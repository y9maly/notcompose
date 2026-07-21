import {
    Modifier,
    NameModifier,
    Node as CompositionNode,
    RecomposeLambda,
    RecomposeLambdaExtensionKey,
    currentComposer
} from "notcompose";
import {AttrsScope} from "../runtime/attributes/AttrsScope.js";
import {
    DomNodeExtensionKey,
    createDomElementState,
    domNodeStateOf
} from "../runtime/DomNodeState.js";

export interface ElementScope<ELEMENT extends Element> {
    readonly element: ELEMENT
}

export interface ElementOptions<ELEMENT extends Element> {
    readonly attrs?: (scope: AttrsScope<ELEMENT>) => void
    readonly content?: (scope: ElementScope<ELEMENT>) => void
}

export type ElementArgument<ELEMENT extends Element> =
    | ElementOptions<ELEMENT>
    | ((scope: ElementScope<ELEMENT>) => void)

export function TagElement<TAG extends keyof HTMLElementTagNameMap>(
    tagName: TAG,
    argument?: ElementArgument<HTMLElementTagNameMap[TAG]>,
): void

export function TagElement<ELEMENT extends Element = HTMLElement>(
    tagName: string,
    argument?: ElementArgument<ELEMENT>,
): void

export function TagElement<ELEMENT extends Element>(
    tagName: string,
    argument?: ElementArgument<ELEMENT>,
) {
    const composer = currentComposer()
    const normalizedTagName = tagName.toLowerCase()
    const options = normalizeArgument(argument)

    composer.startNode(Modifier.then(NameModifier(`<${normalizedTagName}>`)))
    const compositionNode = composer.currentNode!
    const state = ensureElementState<ELEMENT>(compositionNode, normalizedTagName)

    const composeElement = (() => {
        const attrsScope = new AttrsScope<ELEMENT>()
        options.attrs?.(attrsScope)
        state.desiredAttributes = attrsScope.build()
        options.content?.({element: state.node as ELEMENT})
    }) satisfies RecomposeLambda

    composer.applyExtension(RecomposeLambdaExtensionKey, composeElement)
    composer.startComposingNode()
    composeElement()
    composer.endComposingNode()
    composer.endNode()
}

function ensureElementState<ELEMENT extends Element>(
    compositionNode: CompositionNode,
    tagName: string,
) {
    const existing = domNodeStateOf(compositionNode)
    if (existing !== null) {
        if (existing.kind !== 'element' || existing.tagName !== tagName) {
            throw new Error(
                `DOM node at this composition position changed to <${tagName}>. ` +
                `Wrap conditional branches in Key(...) so notcompose can preserve node identity.`
            )
        }
        return existing
    }

    const document = ownerDocumentOf(compositionNode.parent)
    const state = createDomElementState(document.createElement(tagName), tagName)
    currentComposer().applyExtension(DomNodeExtensionKey, state)
    return state
}

function ownerDocumentOf(node: CompositionNode | null): Document {
    let current = node
    while (current !== null) {
        const state = domNodeStateOf(current)
        if (state !== null) {
            const document = state.node.ownerDocument
            if (document !== null)
                return document
        }
        current = current.parent
    }
    throw new Error('Cannot create a DOM element outside an HTML composition')
}

function normalizeArgument<ELEMENT extends Element>(
    argument?: ElementArgument<ELEMENT>,
): ElementOptions<ELEMENT> {
    if (typeof argument === 'function')
        return {content: argument}
    return argument ?? {}
}
