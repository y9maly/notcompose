import {MeasureContext, NodeCoordinator} from "./NodeCoordinator.js";
import {LayoutModifier} from "../runtime/modifiers/LayoutModifier.js";
import {ModifierElement} from "../../notcompose/runtime/Modifier";
import {Constraints} from "../runtime/layout/Constraints";
import {Placeable} from "../runtime/layout/Placeable";
import {assertInt, assertUInt} from "../../core/types";
import {TextCanvas} from "../runtime/ui/graphics/TextCanvas";

export class LayoutModifierNodeCoordinator extends NodeCoordinator {
    constructor(
        elements: ModifierElement[],
        private layoutModifier: LayoutModifier,
        public nextCoordinator: NodeCoordinator,
    ) {
        super(elements)
    }

    private placeChildren: (() => void) | null = null

    measure(context: MeasureContext, constraints: Constraints): Placeable {
        {
            let measureResult = context.beforeMeasure(this.layoutNode, constraints)
            if (measureResult) {
                this.placed = true
                this.width = measureResult.width
                this.height = measureResult.height
                this.placeChildren = () => measureResult.placeChildren()
                return this
            }
        }

        const measureResult = context.afterMeasure(
            this.layoutNode,
            constraints,
            this.layoutModifier.measure(this.nextCoordinator.asMeasurable(context), constraints)
        )
        assertUInt(measureResult.width, measureResult.height)
        this.placed = false
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = () => measureResult.placeChildren()
        return this
    }

    minIntrinsicWidth(context: MeasureContext, height: number): number {
        return this.layoutModifier.minIntrinsicWidth(this.nextCoordinator.asMeasurable(context), height)
    }

    maxIntrinsicWidth(context: MeasureContext, height: number): number {
        return this.layoutModifier.maxIntrinsicWidth(this.nextCoordinator.asMeasurable(context), height)
    }

    minIntrinsicHeight(context: MeasureContext, width: number): number {
        return this.layoutModifier.minIntrinsicHeight(this.nextCoordinator.asMeasurable(context), width)
    }

    maxIntrinsicHeight(context: MeasureContext, width: number): number {
        return this.layoutModifier.maxIntrinsicHeight(this.nextCoordinator.asMeasurable(context), width)
    }

    place(x: number, y: number, z?: number) {
        assertInt(x, y)

        this.placed = true
        this.x = x
        this.y = y
        this.z = z ?? 0
        if (this.placeChildren === null)
            throw new Error(`Must be unreachable. [place] cannot be invoked before [measure].`)
        this.placeChildren()
    }

    nextDrawLambda(canvas: TextCanvas): () => void {
        return () => {
            canvas.save()
            this.nextCoordinator.draw(canvas)
            canvas.restore()
        }
    }
}
