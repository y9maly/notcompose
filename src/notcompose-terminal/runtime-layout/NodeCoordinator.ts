import {ModifierElement} from "../../notcompose/runtime/Modifier";
import {Constraints} from "../runtime/layout/Constraints";
import {Placeable} from "../runtime/layout/Placeable";
import {Measurable, MeasureResult} from "../runtime/layout/Measurable";
import {TextCanvas} from "../runtime/ui/graphics/TextCanvas";
import {DrawModifier} from "../runtime/modifiers/DrawModifier";
import {ContentDrawScope} from "../runtime/ui/graphics/ContentDrawScope";
import {DrawScope} from "../runtime/ui/graphics/DrawScope";
import {LayoutNode} from "./LayoutNode";

export interface MeasureContext {
    beforeMeasure(layoutNode: LayoutNode, constraints: Constraints):
        | void          //
        | MeasureResult // Early return

    afterMeasure(layoutNode: LayoutNode, constraints: Constraints, measureResult: MeasureResult): MeasureResult
}

export abstract class NodeCoordinator {
    public width = 0
    public height = 0
    public placed = false
    public x = 0
    public y = 0
    public z = 0

    protected constructor(
        public elements: ModifierElement[]
    ) {}

    private _layoutNode: LayoutNode | null = null
    set layoutNode(value: LayoutNode) { this._layoutNode = value }
    get layoutNode() { return this._layoutNode ?? this.layoutNodeIsNotInitializedError() }

    abstract measure(context: MeasureContext, constraints: Constraints): Placeable
    // abstract measure(constraints: Constraints): Placeable
    abstract minIntrinsicWidth(context: MeasureContext, height: number | null): number
    abstract maxIntrinsicWidth(context: MeasureContext, height: number | null): number
    abstract minIntrinsicHeight(context: MeasureContext, width: number | null): number
    abstract maxIntrinsicHeight(context: MeasureContext, width: number | null): number

    abstract place(x: number, y: number, z?: number): void

    abstract nextDrawLambda(canvas: TextCanvas): () => void
    draw(canvas: TextCanvas) {
        if (!this.placed)
            return

        let nextDrawModifierIndex = this.elements
            .findIndex(it => DrawModifier.is(it))
        const nextDrawModifierLambda = () => {
            if (nextDrawModifierIndex === -1)
                return this.nextDrawLambda(canvas)

            const nextDrawModifier = DrawModifier.of(this.elements[nextDrawModifierIndex])!
            nextDrawModifierIndex = this.elements
                .findIndex((it, index) => index > nextDrawModifierIndex && DrawModifier.is(it))
            return () => {
                canvas.save()
                nextDrawModifier.draw(ContentDrawScope(DrawScope(canvas, this.width, this.height), nextDrawModifierLambda()))
                canvas.restore()
            }
        }

        canvas.translate(this.x, this.y)
        nextDrawModifierLambda()()
    }

    private layoutNodeIsNotInitializedError(): never {
        throw new Error('layoutNode is not initialized yet')
    }

    asMeasurable(context: MeasureContext): Measurable {
        const coordinator = this
        return {
            measure(constraints: Constraints): Placeable {
                return coordinator.measure(context, constraints)
            },
            minIntrinsicWidth(height: number | null): number {
                return coordinator.minIntrinsicWidth(context, height)
            },
            maxIntrinsicWidth(height: number | null): number {
                return coordinator.maxIntrinsicWidth(context, height)
            },
            minIntrinsicHeight(width: number | null): number {
                return coordinator.minIntrinsicHeight(context, width)
            },
            maxIntrinsicHeight(width: number | null): number {
                return coordinator.maxIntrinsicHeight(context, width)
            },
        }
    }
}
