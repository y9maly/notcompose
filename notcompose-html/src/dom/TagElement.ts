import { currentComposer, NameModifier, Node as CompositionNode, type RecomposeLambda, RecomposeLambdaExtensionKey } from '@notcompose/core'
import { createDomElementState, DomNodeExtensionKey, domNodeStateOf } from '../runtime/DomNodeState.js'
import { Modifier } from '../HtmlModifier.js'

export function TagElement<TAG extends keyof HTMLElementTagNameMap>(
    tagName: TAG,
    content: undefined | (() => void),
    modifier: Modifier,
    options: object,
    // ...args: Args
): void {
    // const [modifier, options, content] = [modifierOf(args), optionsOf(options), contentOf(args)]
    const composer = currentComposer()
    const lowerTagName = tagName.toLowerCase()

    composer.startNode(Modifier.then(
        NameModifier(`<${lowerTagName}>`),
        ...modifier.elements,
        // todo
        ...Object.entries(options).flatMap(([key, value]) => Modifier.prop(key, value).elements)
    ))
    const compositionNode = composer.currentNode!
    const state = ensureElementState(compositionNode, lowerTagName)

    const recompose = (() => { content?.() }) satisfies RecomposeLambda

    composer.applyExtension(RecomposeLambdaExtensionKey, recompose)
    composer.startComposingNode()
    recompose()
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
