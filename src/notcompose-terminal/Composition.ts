import { Composer, Modifier, Node, RecomposeLambda, RecomposeLambdaExtensionKey, withComposer } from 'notcompose'
import { MeasurePolicy, MeasurePolicyExtensionKey, MeasureResult } from 'notcompose/layout'

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

export class Composition {
    public rootNode = new Node(null, Modifier)
    private content: (() => void) | null = null
    private invalidatedCallback: (() => void) | null = null

    constructor(
        private composer: Composer
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
            this.composer.applyExtension(MeasurePolicyExtensionKey, RootMeasurePolicy)
            this.composer.applyExtension(RecomposeLambdaExtensionKey, this.content! satisfies RecomposeLambda)
            this.composer.startComposingNode()
            this.content!()
            this.composer.endComposingNode()
            this.composer.endTree()
        })
    }
}
