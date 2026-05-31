import {MeasureContext, NodeCoordinator} from "./NodeCoordinator";
import {Measurable} from "../runtime/layout/Measurable";
import {Constraints} from "../runtime/layout/Constraints";
import {Placeable} from "../runtime/layout/Placeable";
import {Node} from "../../notcompose/runtime/Node";
import {
    SubconstraintsNodeExtension,
    SubconstraintsNodeExtensionKey
} from "../runtime/nodeExtensions/SubconstraintsNodeExtension";
import {
    SubcomposeNodeExtension,
    SubcomposeNodeExtensionKey,
    SubcomposeScope
} from "../runtime/nodeExtensions/SubcomposeNodeExtension";
import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";

export class LayoutNode {
    constructor(
        public node: Node,
        public outerCoordinator: NodeCoordinator,
        public measurePolicy: MeasurePolicy | null,
        public measure = outerCoordinator.measure.bind(outerCoordinator),
        public minIntrinsicWidth = outerCoordinator.minIntrinsicWidth.bind(outerCoordinator),
        public maxIntrinsicWidth = outerCoordinator.maxIntrinsicWidth.bind(outerCoordinator),
        public minIntrinsicHeight = outerCoordinator.minIntrinsicHeight.bind(outerCoordinator),
        public maxIntrinsicHeight = outerCoordinator.maxIntrinsicHeight.bind(outerCoordinator),
        public place = outerCoordinator.place.bind(outerCoordinator),
        public draw = outerCoordinator.draw.bind(outerCoordinator),
    ) {}

    get hasSubconstraintComposition() { return this.node.hasExtension(SubconstraintsNodeExtensionKey) }
    get hasSubcomposeComposition() { return this.node.hasExtension(SubcomposeNodeExtensionKey) }

    composeSubconstraint(constraints: Constraints) {
        const value = this.node.getExtension(SubconstraintsNodeExtensionKey)
        if (value === undefined)
            throw new Error(`This layout node doesn't have subconstraints composition`)
        value.compose(constraints)
    }

    composeSubcompose(constraints: Constraints, scope: SubcomposeScope) {
        const value = this.node.getExtension(SubcomposeNodeExtensionKey)
        if (value === undefined)
            throw new Error(`This layout node doesn't have subcompose composition`)
        value.subcompose(constraints, scope)
    }

    asMeasurable(context: MeasureContext): Measurable {
        return new LayoutNodeMeasurable(this, context)
    }

    asPlaceable(): Placeable {
        return new LayoutNodePlaceable(this)
    }

    get width() { return this.outerCoordinator.width }
    get height() { return this.outerCoordinator.height }
    get placed() { return this.outerCoordinator.placed }
    get x() { return this.outerCoordinator.x }
    get y() { return this.outerCoordinator.y }
    get z() { return this.outerCoordinator.z }
}


class LayoutNodeMeasurable implements Measurable {
    constructor(
        private readonly layoutNode: LayoutNode,
        private readonly context: MeasureContext,
    ) {}

    measure(constraints: Constraints): Placeable {
        return this.layoutNode.outerCoordinator.measure(this.context, constraints)
    }

    minIntrinsicWidth(height: number | null): number {
        return this.layoutNode.outerCoordinator.minIntrinsicWidth(this.context, height)
    }

    maxIntrinsicWidth(height: number | null): number {
        return this.layoutNode.outerCoordinator.maxIntrinsicWidth(this.context, height)
    }

    minIntrinsicHeight(width: number | null): number {
        return this.layoutNode.outerCoordinator.minIntrinsicHeight(this.context, width)
    }

    maxIntrinsicHeight(width: number | null): number {
        return this.layoutNode.outerCoordinator.maxIntrinsicHeight(this.context, width)
    }
}

class LayoutNodePlaceable implements Placeable {
    constructor(
        private readonly layoutNode: LayoutNode,
    ) {}

    get width() { return this.layoutNode.outerCoordinator.width }
    get height() { return this.layoutNode.outerCoordinator.height }

    place(x: number, y: number, z?: number): void {
        this.layoutNode.outerCoordinator.place(x, y, z ?? 0)
    }
}
