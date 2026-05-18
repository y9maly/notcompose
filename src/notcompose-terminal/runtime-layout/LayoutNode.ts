import {NodeCoordinator} from "./NodeCoordinator";
import {Measurable} from "../runtime/layout/Measurable";
import { Constraints } from "../runtime/layout/Constraints";
import { Placeable } from "../runtime/layout/Placeable";


export class LayoutNode {
    constructor(
        public outerCoordinator: NodeCoordinator,

        public measure = outerCoordinator.measure.bind(outerCoordinator),
        public minIntrinsicWidth = outerCoordinator.minIntrinsicWidth.bind(outerCoordinator),
        public maxIntrinsicWidth = outerCoordinator.maxIntrinsicWidth.bind(outerCoordinator),
        public minIntrinsicHeight = outerCoordinator.minIntrinsicHeight.bind(outerCoordinator),
        public maxIntrinsicHeight = outerCoordinator.maxIntrinsicHeight.bind(outerCoordinator),
        public place = outerCoordinator.place.bind(outerCoordinator),
        public draw = outerCoordinator.draw.bind(outerCoordinator),
    ) {}

    asMeasurable(): Measurable {
        return new LayoutNodeMeasurable(this)
    }

    asPlaceable(): Placeable {
        return new LayoutNodePlaceable(this)
    }

    get width() { return this.outerCoordinator.width }
    get height() { return this.outerCoordinator.height }
    get placed() { return this.outerCoordinator.placed }
    get x() { return this.outerCoordinator.x }
    get y() { return this.outerCoordinator.y }
}


class LayoutNodeMeasurable implements Measurable {
    constructor(
        private readonly layoutNode: LayoutNode,
    ) {}

    measure(constraints: Constraints): Placeable {
        return this.layoutNode.outerCoordinator.measure(constraints)
    }

    minIntrinsicWidth(height: number | null): number {
        return this.layoutNode.outerCoordinator.minIntrinsicWidth(height)
    }

    maxIntrinsicWidth(height: number | null): number {
        return this.layoutNode.outerCoordinator.maxIntrinsicWidth(height)
    }

    minIntrinsicHeight(width: number | null): number {
        return this.layoutNode.outerCoordinator.minIntrinsicHeight(width)
    }

    maxIntrinsicHeight(width: number | null): number {
        return this.layoutNode.outerCoordinator.maxIntrinsicHeight(width)
    }
}

class LayoutNodePlaceable implements Placeable {
    constructor(
        private readonly layoutNode: LayoutNode,
    ) {}

    get width() { return this.layoutNode.outerCoordinator.width }
    get height() { return this.layoutNode.outerCoordinator.height }

    place(x: number, y: number): void {
        this.layoutNode.outerCoordinator.place(x, y)
    }
}
