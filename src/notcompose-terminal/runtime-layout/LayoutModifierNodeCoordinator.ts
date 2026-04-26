import {NodeCoordinator} from "./NodeCoordinator.js";
import {LayoutModifier} from "../runtime/modifiers/LayoutModifier.js";
import {ModifierElement} from "../../notcompose/runtime/Modifier";
import {assertInt} from "../../notcompose/utils/assertInt";
import {Constraints} from "../runtime/layout/Constraints";
import {Placeable} from "../runtime/layout/Placeable";
import {Measurable} from "../runtime/layout/Measurable";


export class LayoutModifierNodeCoordinator extends NodeCoordinator {
    constructor(
        elements: ModifierElement[],
        private layoutModifier: LayoutModifier,
        public nextCoordinator: NodeCoordinator,
    ) {
        super(elements)
    }

    private placeChildren: (() => void) | null = null

    measure(constraints: Constraints): Placeable {
        const measureResult = this.layoutModifier.measure(this.nextCoordinator, constraints)
        assertInt(measureResult.width, measureResult.height)
        this.placed = false
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = () => measureResult.placeChildren()
        return this
    }

    minIntrinsicWidth(height: number): number {
        return this.layoutModifier.minIntrinsicWidth(this.nextCoordinator, height)
    }

    maxIntrinsicWidth(height: number): number {
        return this.layoutModifier.maxIntrinsicWidth(this.nextCoordinator, height)
    }

    minIntrinsicHeight(width: number): number {
        return this.layoutModifier.minIntrinsicHeight(this.nextCoordinator, width)
    }

    maxIntrinsicHeight(width: number): number {
        return this.layoutModifier.maxIntrinsicHeight(this.nextCoordinator, width)
    }

    place(x: number, y: number) {
        assertInt(x, y)

        this.placed = true
        this.x = x
        this.y = y
        if (this.placeChildren === null)
            throw new Error(`Must be unreachable. [place] cannot be invoked before [measure].`)
        this.placeChildren()
    }
}
