import { Composer, Modifier, NameModifier, Node, type RecomposeLambda, RecomposeLambdaExtensionKey, withComposer } from 'notcompose'
import { createDomRootState, DomNodeExtensionKey } from './runtime/DomNodeState.js'

export class HtmlComposition {
    public readonly rootNode: Node
    private content: (() => void) | null = null

    constructor(
        private readonly composer: Composer,
        public readonly rootElement: Element,
    ) {
        this.rootNode = new Node(null, Modifier.then(NameModifier('HtmlRoot')))
        this.rootNode.setExtension(DomNodeExtensionKey, createDomRootState(rootElement))
    }

    setContent(content: () => void) {
        this.content = content
    }

    compose() {
        if (this.content === null)
            throw new Error('No content to compose')

        withComposer(this.composer, () => {
            this.composer.startTree(this.rootNode)
            this.composer.applyExtension(
                RecomposeLambdaExtensionKey,
                this.content! satisfies RecomposeLambda,
            )
            this.composer.startComposingNode()
            this.content!()
            this.composer.endComposingNode()
            this.composer.endTree()
        })
    }
}
