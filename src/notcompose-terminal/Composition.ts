import {Composer} from "../notcompose/runtime/Composer";
import {Modifier} from "../notcompose/runtime/Modifier";
import {currentComposerOrNull, setCurrentComposer} from "../notcompose/runtime/currentComposer";
import {MeasurePolicyNodeExtensionKey} from "./runtime/nodeExtensions/MeasurePolicyNodeExtension";
import {
    RecomposeLambda,
    RecomposeLambdaExtensionKey
} from "../notcompose/runtime-plugins/partialRecomposition/RecomposeLambda";
import {Node} from "../notcompose/runtime/Node";
import {Placeable} from "./runtime/layout/Placeable";
import {MeasurePolicy} from "./runtime/layout/MeasurePolicy";
import {MeasureResult} from "./runtime/layout/Measurable";

const RootMeasurePolicy = MeasurePolicy(
    (measurables, constraints) => {
        let totalWidth = 0
        let totalHeight = 0

        const placeables: Placeable[] = []
        let currentConstraints = constraints
        measurables.forEach(measurable => {
            const placeable = measurable.measure(currentConstraints)
            placeables.push(placeable)
            const { width, height } = placeable
            currentConstraints = currentConstraints.minusMaxHeight(height)
            totalWidth = Math.max(totalWidth, width)
            totalHeight = Math.max(totalHeight, height)
        })

        return MeasureResult(
            constraints.constrainWidth(totalWidth),
            constraints.constrainHeight(totalHeight),
            () => {
                placeables.forEach(placeable => {
                    placeable.place(0, 0)
                })
            }
        )
    }
)

export class Composition {
    public rootNode = new Node(null, new Modifier())
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
        if (callback == null) return
        this.invalidatedCallback = null
        callback()
    }

    invokeWhenInvalidated(callback: () => void): void {
        this.invalidatedCallback = callback
    }

    compose(modifier: Modifier): void {
        if (this.content === null)
            throw new Error('No content to compose')
        const previousComposer = currentComposerOrNull()
        setCurrentComposer(this.composer)
        this.rootNode.modifier = modifier
        this.composer.startRootNode(this.rootNode)
        this.composer.applyExtension(MeasurePolicyNodeExtensionKey, RootMeasurePolicy)
        this.composer.applyExtension(RecomposeLambdaExtensionKey, this.content satisfies RecomposeLambda)
        this.composer.startComposingNode()
        this.content()
        this.composer.endComposingNode()
        this.composer.endRootNode()
        setCurrentComposer(previousComposer)
    }
}
