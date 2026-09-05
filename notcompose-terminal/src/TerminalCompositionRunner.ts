import { type CompositionSession, currentComposer, Modifier, Node, RecomposeLambdaExtensionKey } from '@notcompose/core'
import { MeasurePolicy, MeasurePolicyExtensionKey, MeasureResult } from '@notcompose/layout'

const RootMeasurePolicy = MeasurePolicy(
    (measurables, constraints) => {
        const childrenConstraints = constraints.copyMaxDimensions()
        const placeables = measurables
            .map(it => it.measure(childrenConstraints))

        if (constraints.maxWidth === null || constraints.maxHeight === null)
            throw new Error(`Root layout cannot have unbounded dimensions`)

        return MeasureResult(constraints.maxWidth, constraints.maxHeight, () => {
            placeables.forEach(placeable => {
                placeable.place(0, 0)
            })
        })
    }
)

export class TerminalCompositionRunner {
    public readonly rootNode = new Node(null, Modifier)
    private content: (() => void) | null = null
    private invalidatedCallback: (() => void) | null = null
    private runnerFrame = 0
    private contentFrame = 0

    constructor(
        private compositionSession: CompositionSession,
    ) {}

    setContent(content: () => void): void {
        this.content = content
        this.contentFrame = 0
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
        this.runnerFrame++
        this.contentFrame++

        this.compositionSession.compose(() => {
            this.rootNode.modifier = modifier
            currentComposer().startTree(this.rootNode)
            currentComposer().applyExtension(MeasurePolicyExtensionKey, RootMeasurePolicy)
            currentComposer().applyExtension(RecomposeLambdaExtensionKey, this.content!)
            currentComposer().startComposingNode()
            this.content!()
            currentComposer().endComposingNode()
            currentComposer().endTree()
        }, {
            debugInformation: `currentContentRootFrame = ${this.contentFrame}\nterminalRunnerRootFrame = ${this.runnerFrame}`
        })
    }
}
