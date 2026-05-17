import {ModifierElement} from "../../notcompose/runtime/Modifier";
import {Constraints} from "../runtime/layout/Constraints";
import {Placeable} from "../runtime/layout/Placeable";
import {Measurable} from "../runtime/layout/Measurable";
import {TextCanvas} from "../runtime/ui/graphics/TextCanvas";
import {DrawModifier} from "../runtime/modifiers/DrawModifier";
import {ContentDrawScope} from "../runtime/ui/graphics/ContentDrawScope";
import {DrawScope} from "../runtime/ui/graphics/DrawScope";


export abstract class NodeCoordinator implements Measurable, Placeable {
    public width = 0
    public height = 0
    public placed = false
    public x = 0
    public y = 0
    // public z = 0

    protected constructor(
        public elements: ModifierElement[]
    ) {}

    abstract measure(constraints: Constraints): Placeable
    abstract minIntrinsicWidth(height: number | null): number
    abstract maxIntrinsicWidth(height: number | null): number
    abstract minIntrinsicHeight(width: number | null): number
    abstract maxIntrinsicHeight(width: number | null): number

    abstract place(x: number, y: number): void

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
                canvas.translate(this.x, this.y)
                nextDrawModifier.draw(ContentDrawScope(DrawScope(canvas, this.width, this.height), nextDrawModifierLambda()))
                canvas.restore()
            }
        }

        nextDrawModifierLambda()()
    }
}
