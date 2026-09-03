import { Composer, Modifier, Node, type RecomposeLambda, RecomposeLambdaExtensionKey, withComposer } from '@notcompose/core'

export class TestComposition {
    public readonly rootNode = new Node(null, Modifier)
    private content: (() => void) | null = null
    private invalidatedCallback: (() => void) | null = null

    constructor(
        private composer: Composer,
    ) {}

    setContent(content: () => void): void {
        this.content = content
    }

    invalidate() {
        const callback = this.invalidatedCallback
        if (callback === null) return
        this.invalidatedCallback = null
        callback()
    }

    invokeWhenInvalidated(callback: () => void): void {
        this.invalidatedCallback = callback
    }

    compose(modifier: Modifier): void {
        if (this.content === null)
            throw new Error('No content to compose')

        withComposer(this.composer, () => {
            this.rootNode.modifier = modifier
            this.composer.startTree(this.rootNode)
            this.composer.applyExtension(RecomposeLambdaExtensionKey, this.content! satisfies RecomposeLambda)
            this.composer.startComposingNode()
            this.content!()
            this.composer.endComposingNode()
            this.composer.endTree()
        })
    }
}