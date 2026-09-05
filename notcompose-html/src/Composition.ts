import { type CompositionSession, currentComposer, Modifier, NameModifier, Node, RecomposeLambdaExtensionKey } from '@notcompose/core'
import { createDomRootState, DomNodeExtensionKey } from './runtime/DomNodeState.js'

export class HtmlCompositionRunner {
    public readonly rootNode: Node
    private content: (() => void) | null = null
    private runnerFrame = 0
    private contentFrame = 0

    constructor(
        private readonly compositionSession: CompositionSession,
        public readonly rootElement: Element,
    ) {
        this.rootNode = new Node(null, Modifier.then(NameModifier('HtmlRoot')))
        this.rootNode.setExtension(DomNodeExtensionKey, createDomRootState(rootElement))
    }

    setContent(content: () => void) {
        this.content = content
        this.contentFrame = 0
    }

    compose() {
        if (this.content === null)
            throw new Error('No content to compose')
        this.runnerFrame++
        this.contentFrame++

        this.compositionSession.compose(() => {
            currentComposer().startTree(this.rootNode)
            currentComposer().applyExtension(RecomposeLambdaExtensionKey, this.content!)
            currentComposer().startComposingNode()
            this.content!()
            currentComposer().endComposingNode()
            currentComposer().endTree()
        }, {
            debugInformation: `currentContentRootFrame = ${this.contentFrame}\nhtmlRunnerRootFrame = ${this.runnerFrame}`
        })
    }
}
