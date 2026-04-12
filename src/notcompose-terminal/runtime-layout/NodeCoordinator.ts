import {Constraints, Measurable, Placeable} from "../runtime/layout/measure.js";
import {ModifierElement} from "../../notcompose/runtime/Modifier";


export abstract class NodeCoordinator implements Measurable, Placeable {
    public width = 0
    public height = 0
    public placed = false
    public x = 0
    public y = 0

    protected constructor(
        public elements: ModifierElement[]
    ) {}

    abstract measure(constraints: Constraints): Placeable

    abstract place(x: number, y: number): void
}
