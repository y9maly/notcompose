import {ModifierElement} from "../../notcompose/runtime/Modifier";
import {Constraints} from "../runtime/layout/Constraints";
import {Placeable} from "../runtime/layout/Placeable";
import {Measurable} from "../runtime/layout/Measurable";


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
    abstract minIntrinsicWidth(height: number | null): number
    abstract maxIntrinsicWidth(height: number | null): number
    abstract minIntrinsicHeight(width: number | null): number
    abstract maxIntrinsicHeight(width: number | null): number

    abstract place(x: number, y: number): void
}
