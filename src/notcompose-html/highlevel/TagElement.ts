import { NameModifier, Node as CompositionNode, type RecomposeLambda, RecomposeLambdaExtensionKey, currentComposer } from 'notcompose'
import { DomNodeExtensionKey, createDomElementState, domNodeStateOf } from '../runtime/DomNodeState.js'
import { Modifier } from '../HtmlModifier.js'
import { type Args, contentOf, modifierOf, type Options, optionsOf } from './types.js'

export function TagElement<TAG extends keyof HTMLElementTagNameMap>(
    tagName: TAG,
    ...args: Args
): void {
    const composer = currentComposer()
    const lowerTagName = tagName.toLowerCase()

    composer.startNode(Modifier.then(
        NameModifier(`<${lowerTagName}>`),
        ...modifierOf(args).elements,
        // todo
        ...Object.entries(optionsOf(args) ?? {}).flatMap(([key, value]) => Modifier.prop(key, value).elements)
    ))
    const compositionNode = composer.currentNode!
    const state = ensureElementState(compositionNode, lowerTagName)

    const recompose = (() => { contentOf(args)?.() }) satisfies RecomposeLambda

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
