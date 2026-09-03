import { currentComposer, Modifier, NameModifier, Node as CompositionNode, type RecomposeLambda, RecomposeLambdaExtensionKey } from 'notcompose'
import { createDomTextState, DomNodeExtensionKey, domNodeStateOf } from '../runtime/DomNodeState.js'

export function Text(value: string | number | boolean) {
    const composer = currentComposer()
    composer.startNode(Modifier.then(NameModifier('Text')))

    const compositionNode = composer.currentNode!
    let state = domNodeStateOf(compositionNode)
    if (state === null) {
        const document = ownerDocumentOf(compositionNode.parent)
        state = createDomTextState(document.createTextNode(''))
        composer.applyExtension(DomNodeExtensionKey, state)
    } else if (state.kind !== 'text') {
        throw new Error(
            `DOM node at this composition position changed to Text. ` +
            `Wrap conditional branches in Key(...) so notcompose can preserve node identity.`
        )
    }

    const textState = state
    const composeText = (() => {
        textState.desiredData = String(value)
    }) satisfies RecomposeLambda

    composer.applyExtension(RecomposeLambdaExtensionKey, composeText)
    composer.startComposingNode()
    composeText()
    composer.endComposingNode()
    composer.endNode()
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
    throw new Error('Cannot create a DOM text node outside an HTML composition')
}
