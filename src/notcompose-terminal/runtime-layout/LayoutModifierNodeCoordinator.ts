import {NodeCoordinator} from "./NodeCoordinator.js";
import {LayoutModifier} from "../runtime/modifiers/LayoutModifier.js";
import {Constraints, Measurable, Placeable} from "../runtime/layout/measure.js";
import {ModifierElement} from "../../notcompose/runtime/Modifier";
import {assertInt} from "../../notcompose/utils/assertInt";


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
        assertInt(measureResult.width, measureResult.height)
        this.placed = false
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = () => measureResult.placeChildren()
        return this
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
