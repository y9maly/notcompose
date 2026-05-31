import {Node} from "../../notcompose/runtime/Node";
import {Composer, Key} from "../../notcompose/runtime/Composer";
import {applyLayoutNode as oldApplyLayoutNode} from "../../notcompose-terminal/runtime-layout/applyLayoutNode";
import {currentComposer, withComposer} from "../../notcompose/runtime/currentComposer";

import {Constraints} from "../../notcompose-terminal/runtime/layout/Constraints";
import {
    RecomposeLambda,
    RecomposeLambdaExtensionKey
} from "../../notcompose/runtime-plugins/partialRecomposition/RecomposeLambda";
import {LayoutProcessorPluginDebug} from "../../notcompose-terminal/runtime-layout/LayoutProcessorPlugin";
import {MeasurePolicyExtensionKey} from "../../notcompose-terminal/runtime/nodeExtensions/MeasurePolicyNodeExtension";
import {EmptyMeasurePolicy} from "../../notcompose-terminal/highlevel/Empty";
import {
    SubcomposeNodeExtension,
    SubcomposeNodeExtensionKey, SubcomposeScope
} from "../../notcompose-terminal/runtime/nodeExtensions/SubcomposeNodeExtension";
import {LayoutNode, LayoutNodeExtensionKey} from "./layoutNode/LayoutNode";
import {applyLayoutNode as newApplyLayoutNode} from "./layoutNode/applyLayoutNode";
import {Measurer} from "./measurer/Measurer";
import {LayoutNodeCoordinator} from "./layoutNode/LayoutNodeCoordinator";
import {LayoutModifierLayoutNodeCoordinator} from "./layoutNode/LayoutModifierLayoutNodeCoordinator";
import {currentMeasurer, withMeasurer} from "./measurer/currentMeasurer";
import {Measurable, MeasureResult} from "../../notcompose-terminal/runtime/layout/Measurable";
import {Placeable} from "../../notcompose-terminal/runtime/layout/Placeable";
import {InnerLayoutNodeCoordinator} from "./layoutNode/InnerLayoutNodeCoordinator";
import {
    SubconstraintsNodeExtension,
    SubconstraintsNodeExtensionKey
} from "../../notcompose-terminal/runtime/nodeExtensions/SubconstraintsNodeExtension";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {assertUInt} from "../../core/types";

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
        const layoutNode = newApplyLayoutNode(node)

        // this.params.interceptMeasurement(() => layoutNode.measure(plugin, constraints))
        const placeable = this.measure(layoutNode, constraints, (node, content) => {
            withComposer(composer, () => {
                composer.startTree(node)
                composer.applyExtension(RecomposeLambdaExtensionKey, content satisfies RecomposeLambda)
                composer.startComposingNode()
                content()
                composer.endComposingNode()
                composer.endTree()
            })
        })
        // layoutNode.outerCoordinator = InnerNodeCoordinator()

        // todo Placer
        placeable.place(0, 0, 0)

        // this.params.interceptPlacement(() => layoutNode.place(0, 0, 0))
    }

    private measure(
        layoutNode: LayoutNode,
        constraints: Constraints,
        latecompose: (node: Node, content: () => void) => void,
    ): Placeable {
        const plugin = new LayoutProcessorPluginDebug()
        const measurer = new Measurer([{
            onStartMeasurement(coordinator, constraints) {
                plugin.beforeMeasure(coordinator.findNode().getExtension(LayoutNodeExtensionKey)!, constraints)
            },

            onEndMeasurement(coordinator, constraints, measureResult) {
                plugin.afterMeasure(coordinator.findNode().getExtension(LayoutNodeExtensionKey)!, constraints, measureResult)
            }
        }]) // todo

        // const measurePolicy = node.getExtension(MeasurePolicyExtensionKey) ?? EmptyMeasurePolicy
        // const layoutNode = newApplyLayoutNode(node)

        return withMeasurer(measurer, () => {
            const placeable = coordinatorAsMeasurable(layoutNode.outerCoordinator, measurer, latecompose).measure(constraints)
            return placeable
        })
    }
}



function coordinatorAsMeasurable(
    coordinator: LayoutNodeCoordinator,
    measurer: Measurer,
    latecompose: (node: Node, content: () => void) => void,
): Measurable {
    if (coordinator instanceof LayoutModifierLayoutNodeCoordinator)
        return layoutModifierCoordinatorAsMeasurable(coordinator, measurer, latecompose)
    else
        return innerCoordinatorAsMeasurable(coordinator, measurer, latecompose)
}

function layoutModifierCoordinatorAsMeasurable(
    coordinator: LayoutModifierLayoutNodeCoordinator,
    measurer: Measurer,
    latecompose: (node: Node, content: () => void) => void,
): Measurable {
    return {
        measure: function (constraints: Constraints): Placeable {
            const nextMeasurable = coordinatorAsMeasurable(coordinator.nextCoordinator, measurer, latecompose)

            currentMeasurer().startMeasurement(coordinator, constraints)
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

function innerCoordinatorAsMeasurable(
    coordinator: InnerLayoutNodeCoordinator,
    measurer: Measurer,
    latecompose: (node: Node, content: () => void) => void,
): Measurable {
    return {
        measure: function (constraints: Constraints): Placeable {
            const subconstraintsExtension = coordinator.node.getExtension(SubconstraintsNodeExtensionKey)
            if (subconstraintsExtension) {
                subconstraint(coordinator.node, subconstraintsExtension, constraints, latecompose)
            }

            const subcomposeExtension = coordinator.node.getExtension(SubcomposeNodeExtensionKey)
            if (subcomposeExtension) {
                measurer.startMeasurement(coordinator, constraints)
                const measureResult = subcompose(coordinator.node, subcomposeExtension, constraints, measurer, latecompose)
                measurer.endMeasurement(measureResult)

                return coordinatorAsPlaceable(coordinator)
            } else {
                const childrenLayoutNodes = createChildrenLayoutNodes(coordinator.node.children)
                const childrenMeasurables = childrenLayoutNodes.map(it => coordinatorAsMeasurable(it.outerCoordinator, measurer, latecompose))

                measurer.startMeasurement(coordinator, constraints)
                const measureResult = coordinator.measurePolicy.measure(childrenMeasurables, constraints)
                measurer.endMeasurement(measureResult)

                return coordinatorAsPlaceable(coordinator)
            }
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

function subconstraint(
    node: Node,
    extension: SubconstraintsNodeExtension,
    constraints: Constraints,
    latecompose: (node: Node, content: () => void) => void,
) {
    latecompose(node, () => extension.compose(constraints))
}

function subcompose(
    node: Node,
    extension: SubcomposeNodeExtension,
    constraints: Constraints,
    measurer: Measurer,
    latecompose: (node: Node, content: () => void) => void,
) {
    let measureResult: MeasureResult | undefined
    const subcomposes: { key: Key | null, node: Node }[] = []
    extension.subcompose(constraints, {
        subcompose(key, content) {
            const node = new Node(null, new Modifier())
            subcomposes.push({ key, node })

            measurer.exitMeasurement()
            latecompose(node, content)
            measurer.reenterMeasurement()

            node.children.forEach(({ node }) => {
                node.parent = null
            })

            return createChildrenLayoutNodes(node.children)
                .map(it => coordinatorAsMeasurable(it.outerCoordinator, measurer, latecompose))
        },

        commit(_measureResult) {
            if (measureResult !== undefined)
                throw new Error(`commit must be called only once`)
            measureResult = _measureResult

            measurer.exitMeasurement()
            latecompose(node, () => {
                subcomposes.forEach(({ key, node }) => {
                    if (key === null)
                        currentComposer().insertNode(node)
                    else
                        currentComposer().insertNode(node, key)

                    currentComposer().endNode()
                })

                subcomposes.length = 0
            })
            measurer.reenterMeasurement()
        }
    } satisfies SubcomposeScope)

    if (measureResult === undefined)
        throw new Error(`'commit' must be called`)
    assertUInt(measureResult.width, measureResult.height)
    return measureResult
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
            coordinator.makePlaced(x, y, z)
            coordinator.placeChildren()
            // todo currentPlacer().endPlacement.......
        }
    }
}
