import {Node} from "../../notcompose/runtime/Node";
import {Composer, Key} from "../../notcompose/runtime/Composer";
import {applyLayoutNode as oldApplyLayoutNode} from "./applyLayoutNode";
import {withComposer} from "../../notcompose/runtime/currentComposer";

import {Constraints} from "../runtime/layout/Constraints";
import {
    RecomposeLambda,
    RecomposeLambdaExtensionKey
} from "../../notcompose/runtime-plugins/partialRecomposition/RecomposeLambda";
import {LayoutProcessorPluginDebug} from "./LayoutProcessorPlugin";
import {MeasurePolicyExtensionKey} from "../runtime/nodeExtensions/MeasurePolicyNodeExtension";
import {EmptyMeasurePolicy} from "../highlevel/Empty";
import {SubcomposeNodeExtensionKey} from "../runtime/nodeExtensions/SubcomposeNodeExtension";
import {LayoutNode} from "../../notcompose-layout/runtime/LayoutNode";
import {applyLayoutNode as newApplyLayoutNode} from "../../notcompose-layout/runtime/applyLayoutNode";
import {Measurer} from "../../notcompose-layout/runtime/Measurer";
import {LayoutNodeCoordinator} from "../../notcompose-layout/runtime/LayoutNodeCoordinator";
import {LayoutModifierLayoutNodeCoordinator} from "../../notcompose-layout/runtime/LayoutModifierLayoutNodeCoordinator";
import {currentMeasurer, withMeasurer} from "../../notcompose-layout/runtime/currentMeasurer";
import {Measurable} from "../runtime/layout/Measurable";
import {Placeable} from "../runtime/layout/Placeable";
import {InnerLayoutNodeCoordinator} from "../../notcompose-layout/runtime/InnerLayoutNodeCoordinator";

export class LayoutProcessor {
    constructor(
        // todo Subject to remove.
        private readonly params: {
            interceptMeasurement: (invoke: () => void) => void,
            interceptPlacement: (invoke: () => void) => void,
        } = {
            interceptMeasurement: it => it(),
            interceptPlacement: it => it(),
        }
    ) {}

    // composer используется для Subconstraints/Subcompose
    layout(node: Node, composer: Composer, constraints: Constraints) {
        const plugin = new LayoutProcessorPluginDebug()

        // const layoutNode = oldApplyLayoutNode(node, (content, node) => {
        //     withComposer(composer, () => {
        //         composer.startTree(node)
        //         composer.applyExtension(RecomposeLambdaExtensionKey, content satisfies RecomposeLambda)
        //         composer.startComposingNode()
        //         content()
        //         composer.endComposingNode()
        //         composer.endTree()
        //     })
        // })

        const layoutNode = newApplyLayoutNode(node)

        // this.params.interceptMeasurement(() => layoutNode.measure(plugin, constraints))
        const placeable = this.measure(layoutNode, constraints)
        // layoutNode.outerCoordinator = InnerNodeCoordinator()

        placeable.place(0, 0, 0)

        // this.params.interceptPlacement(() => layoutNode.place(0, 0, 0))
    }

    private measure(layoutNode: LayoutNode, constraints: Constraints): Placeable {
        const measurer = new Measurer([]) // todo
        // const measurePolicy = node.getExtension(MeasurePolicyExtensionKey) ?? EmptyMeasurePolicy
        // const layoutNode = newApplyLayoutNode(node)

        return withMeasurer(measurer, () => {
            const placeable = coordinatorAsMeasurable(layoutNode.outerCoordinator).measure(constraints)
            return placeable
        })
    }
}



function coordinatorAsMeasurable(coordinator: LayoutNodeCoordinator): Measurable {
    if (coordinator instanceof LayoutModifierLayoutNodeCoordinator)
        return layoutModifierCoordinatorAsMeasurable(coordinator)
    else
        return innerCoordinatorAsMeasurable(coordinator)
}

function layoutModifierCoordinatorAsMeasurable(coordinator: LayoutModifierLayoutNodeCoordinator): Measurable {
    return {
        measure: function (constraints: Constraints): Placeable {
            const nextMeasurable = coordinatorAsMeasurable(coordinator.next)

            currentMeasurer().startMeasurement(coordinator)
            const measureResult = coordinator.layoutModifier.measure(nextMeasurable, constraints)
            currentMeasurer().endMeasurement(measureResult)

            return coordinatorAsPlaceable(coordinator)
        },

        minIntrinsicWidth: function (height: number | null): number {
            throw new Error("Function not implemented.");
        },

        maxIntrinsicWidth: function (height: number | null): number {
            throw new Error("Function not implemented.");
        },

        minIntrinsicHeight: function (width: number | null): number {
            throw new Error("Function not implemented.");
        },

        maxIntrinsicHeight: function (width: number | null): number {
            throw new Error("Function not implemented.");
        }
    }
}

function innerCoordinatorAsMeasurable(coordinator: InnerLayoutNodeCoordinator): Measurable {
    return {
        measure: function (constraints: Constraints): Placeable {
            const childrenLayoutNodes = createChildrenLayoutNodes(coordinator.node.children)
            const childrenMeasurables = childrenLayoutNodes.map(it => coordinatorAsMeasurable(it.outerCoordinator))

            currentMeasurer().startMeasurement(coordinator)
            const measureResult = coordinator.measurePolicy.measure(childrenMeasurables, constraints)
            currentMeasurer().endMeasurement(measureResult)

            return coordinatorAsPlaceable(coordinator)
        },

        minIntrinsicWidth: function (height: number | null): number {
            throw new Error("Function not implemented.");
        },

        maxIntrinsicWidth: function (height: number | null): number {
            throw new Error("Function not implemented.");
        },

        minIntrinsicHeight: function (width: number | null): number {
            throw new Error("Function not implemented.");
        },

        maxIntrinsicHeight: function (width: number | null): number {
            throw new Error("Function not implemented.");
        }
    }
}

function createChildrenLayoutNodes(
    children: ReadonlyArray<{ key: Key | null, node: Node }>,
): LayoutNode[] {
    const result: LayoutNode[] = []

    const queue = children.map(it => it.node)
    while (queue.length > 0) {
        const node = queue.shift()!

        if (node.hasExtension(MeasurePolicyExtensionKey) || node.hasExtension(SubcomposeNodeExtensionKey)) {
            // Если нода умеет распологать детей - добавить её как дочерний coordinator
            // Если дерево ещё не построено, то [coordinator] достроит его сам.
            const layoutNode = newApplyLayoutNode(node)
            result.push(layoutNode)
        } else {
            // Если нода НЕ умеет распологать детей - добавить её детей напрямую
            queue.unshift(...node.children.map(it => it.node))
        }
    }

    return result
}

function coordinatorAsPlaceable(coordinator: LayoutNodeCoordinator): Placeable {
    return {
        height: coordinator.height,
        width: coordinator.width,
        place(x: number, y: number, z?: number): void {
            // todo currentPlacer().startPlacement.......
            coordinator.place(x, y, z)
            coordinator.placeChildren()
            // todo currentPlacer().endPlacement.......
        }
    }
}
