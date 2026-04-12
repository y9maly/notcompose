import {NodeCoordinator} from "./NodeCoordinator.js";
import {LayoutModifier} from "../runtime/modifiers/LayoutModifier.js";
import {Constraints, Measurable, Placeable} from "../runtime/layout/measure.js";
import {ModifierElement} from "../../notcompose/runtime/Modifier";


export class LayoutModifierNodeCoordinator extends NodeCoordinator {
    private readonly nextCoordinatorMeasurable: Measurable

    constructor(
        elements: ModifierElement[],
        private layoutModifier: LayoutModifier,
        public nextCoordinator: NodeCoordinator,
    ) {
        super(elements)
        this.nextCoordinatorMeasurable = {
            measure(constraints: Constraints) {
                return nextCoordinator.measure(constraints)
            }
        }
    }

    private placeChildren: (() => void) | null = null

    measure(constraints: Constraints): Placeable {
        const measureResult = this.layoutModifier.measure(this.nextCoordinatorMeasurable, constraints)
        if (isNaN(measureResult.width)) throw new Error('width is NaN')
        if (isNaN(measureResult.height)) throw new Error('height is NaN')
        if (!Number.isInteger(measureResult.width)) throw new Error('width is not an integer')
        if (!Number.isInteger(measureResult.width)) throw new Error('height is not an integer')
        this.placed = false
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = () => measureResult.placeChildren()
        return this
    }

    place(x: number, y: number) {
        if (isNaN(x)) throw new Error('x is NaN')
        if (isNaN(y)) throw new Error('y is NaN')
        if (!Number.isInteger(x)) throw new Error('x is not an integer')
        if (!Number.isInteger(y)) throw new Error('y is not an integer')

        this.placed = true
        this.x = x
        this.y = y
        if (this.placeChildren === null)
            throw new Error(`Must be unreachable. [place] cannot be invoked before [measure].`)
        this.placeChildren()
    }
}
