import {MeasureContext, NodeCoordinator} from "./NodeCoordinator.js";
import {MeasurePolicyNodeExtensionKey} from "../runtime/nodeExtensions/MeasurePolicyNodeExtension.js";
import {applyLayoutNode} from "./applyLayoutNode.js";
import {Modifier, ModifierElement} from "../../notcompose/runtime/Modifier";
import {Node} from "../../notcompose/runtime/Node";
import {SubcomposeNodeExtensionKey, SubcomposeScope} from "../runtime/nodeExtensions/SubcomposeNodeExtension";
import {Key} from "../../notcompose/runtime/Composer";
import {currentComposer} from "../../notcompose/runtime/currentComposer";
import {Constraints} from "../runtime/layout/Constraints";
import {Placeable} from "../runtime/layout/Placeable";
import {Measurable, MeasureResult} from "../runtime/layout/Measurable";
import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";
import {assertInt, assertUInt} from "../../core/types";
import {TextCanvas} from "../runtime/ui/graphics/TextCanvas";
import {LayoutNodeExtensionKey} from "../runtime/nodeExtensions/LayoutNodeExtension";
import {LayoutNode} from "./LayoutNode";

export class InnerNodeCoordinator extends NodeCoordinator {
    constructor(
        elements: ModifierElement[],
        public insert: (content: () => void, node: Node) => void,
        public measurePolicy: MeasurePolicy | null
    ) { super(elements) }

    private placeChildren: (() => void) | null = null

    measure(context: MeasureContext, constraints: Constraints): Placeable {
        {
            let measureResult = context.beforeMeasure(this.layoutNode, constraints)
            if (measureResult) {
                this.placed = true
                this.width = measureResult.width
                this.height = measureResult.height
                this.placeChildren = () => measureResult.placeChildren()
                return this
            }
        }

        if (this.layoutNode.hasSubconstraintComposition) {
            subconstraint(this.layoutNode, constraints, this.insert)
        }

        if (this.layoutNode.hasSubcomposeComposition) {
            const measureResult = context.afterMeasure(
                this.layoutNode,
                constraints,
                subcompose(context, this.layoutNode, constraints, this.insert)
            )
            assertUInt(measureResult.width, measureResult.height)
            this.placed = true
            this.width = measureResult.width
            this.height = measureResult.height
            this.placeChildren = () => measureResult.placeChildren()
            return this
        }

        if (this.measurePolicy === null) {
            const measureResult = context.afterMeasure(
                this.layoutNode,
                constraints,
                MeasureResult(constraints.minWidth, constraints.minHeight)
            )
            this.placed = true
            this.width = measureResult.width
            this.height = measureResult.height
            this.placeChildren = measureResult.placeChildren
            return this
        }

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.layoutNode.node.children, this.insert)
            .map(it => it.asMeasurable(context))

        const measureResult = context.afterMeasure(
            this.layoutNode,
            constraints,
            this.measurePolicy.measure(childrenMeasurables, constraints)
        )
        assertUInt(measureResult.width, measureResult.height)
        this.placed = false
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = () => measureResult.placeChildren()
        return this
    }

    minIntrinsicWidth(context: MeasureContext, height: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.layoutNode.node.children, this.insert)
            .map(it => it.asMeasurable(context))

        return this.measurePolicy?.minIntrinsicWidth(childrenMeasurables, height)
    }

    maxIntrinsicWidth(context: MeasureContext, height: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.layoutNode.node.children, this.insert)
            .map(it => it.asMeasurable(context))

        return this.measurePolicy?.maxIntrinsicWidth(childrenMeasurables, height)
    }

    minIntrinsicHeight(context: MeasureContext, width: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.layoutNode.node.children, this.insert)
            .map(it => it.asMeasurable(context))

        return this.measurePolicy?.minIntrinsicHeight(childrenMeasurables, width)
    }

    maxIntrinsicHeight(context: MeasureContext, width: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.layoutNode.node.children, this.insert)
            .map(it => it.asMeasurable(context))

        return this.measurePolicy?.maxIntrinsicHeight(childrenMeasurables, width)
    }

    place(x: number, y: number, z?: number) {
        assertInt(x, y)

        this.placed = true
        this.x = x
        this.y = y
        this.z = z ?? 0
        if (this.placeChildren === null)
            throw new Error(`Must be unreachable. [place] cannot be invoked before [measure].`)
        this.placeChildren()
    }

    nextDrawLambda(canvas: TextCanvas): () => void {
        return () => {
            const childrenLayoutNodes = reuseChildrenLayoutNodes(this.layoutNode.node.children)
                .sort((a, b) => a.z - b.z)

            for (const childrenLayoutNode of childrenLayoutNodes) {
                if (childrenLayoutNode.placed) {
                    canvas.save()
                    childrenLayoutNode.outerCoordinator.draw(canvas)
                    canvas.restore()
                }
            }
        }
    }
}

function subconstraint(layoutNode: LayoutNode, constraints: Constraints, insert: (block: () => void, node: Node) => void): void {
    insert(() => {
        // todo exit
        layoutNode.composeSubconstraint(constraints)
        // todo enter
    }, layoutNode.node)
}

function subcompose(context: MeasureContext, layoutNode: LayoutNode, constraints: Constraints, insert: (block: () => void, node: Node) => void): MeasureResult {
    let measureResult: MeasureResult | undefined
    const subcomposes: { key: Key | null, node: Node }[] = []
    layoutNode.composeSubcompose(constraints, {
        subcompose(key, content) {
            const node = new Node(null, new Modifier())
            subcomposes.push({ key, node })

            // todo exit
            insert(content, node)
            // todo enter

            node.children.forEach(({ node }) => {
                node.parent = null
            })

            return createChildrenLayoutNodes(node.children, insert)
                .map(it => it.asMeasurable(context))
        },

        commit(_measureResult) {
            if (measureResult !== undefined)
                throw new Error(`commit must be called only once`)
            measureResult = _measureResult

            insert(() => {
                subcomposes.forEach(({ key, node }) => {
                    if (key === null)
                        currentComposer().insertNode(node)
                    else
                        currentComposer().insertNode(node, key)

                    currentComposer().endNode()
                })

                subcomposes.length = 0
            }, layoutNode.node)
        }
    } satisfies SubcomposeScope)

    if (measureResult === undefined)
        throw new Error(`'commit' must be called`)
    assertUInt(measureResult.width, measureResult.height)
    return measureResult
}

function reuseChildrenLayoutNodes(
    children: ReadonlyArray<{ key: Key | null, node: Node }>,
): LayoutNode[] {
    const result: LayoutNode[] = []

    const queue = children.map(it => it.node)
    while (queue.length > 0) {
        const node = queue.shift()!

        if (node.extensions.has(MeasurePolicyNodeExtensionKey) || node.extensions.has(SubcomposeNodeExtensionKey)) {
            // Если нода умеет распологать детей - добавить её как дочерний coordinator
            // Если дерево ещё не построено, то [coordinator] достроит его сам.
            const layoutNode = node.extensions.get(LayoutNodeExtensionKey) as LayoutNode | undefined
            if (layoutNode !== undefined)
                result.push(layoutNode)
        } else {
            // Если нода НЕ умеет распологать детей - добавить её детей напрямую
            queue.unshift(...node.children.map(it => it.node))
        }
    }

    return result
}

function createChildrenLayoutNodes(
    children: ReadonlyArray<{ key: Key | null, node: Node }>,
    insert: (block: () => void, node: Node) => void
): LayoutNode[] {
    const result: LayoutNode[] = []

    const queue = children.map(it => it.node)
    while (queue.length > 0) {
        const node = queue.shift()!

        if (node.extensions.has(MeasurePolicyNodeExtensionKey) || node.extensions.has(SubcomposeNodeExtensionKey)) {
            // Если нода умеет распологать детей - добавить её как дочерний coordinator
            // Если дерево ещё не построено, то [coordinator] достроит его сам.
            const layoutNode = applyLayoutNode(node, insert)
            result.push(layoutNode)
        } else {
            // Если нода НЕ умеет распологать детей - добавить её детей напрямую
            queue.unshift(...node.children.map(it => it.node))
        }
    }

    return result
}
