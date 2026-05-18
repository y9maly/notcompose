import {NodeCoordinator} from "./NodeCoordinator.js";
import {MeasurePolicyNodeExtensionKey} from "../runtime/nodeExtensions/MeasurePolicyNodeExtension.js";
import {applyLayoutNode} from "./applyLayoutNode.js";
import {
    SubconstraintsNodeExtension,
    SubconstraintsNodeExtensionKey
} from "../runtime/nodeExtensions/SubconstraintsNodeExtension.js";
import {Modifier, ModifierElement} from "../../notcompose/runtime/Modifier";
import {Node} from "../../notcompose/runtime/Node";
import {
    SubcomposeNodeExtension,
    SubcomposeNodeExtensionKey,
    SubcomposeScope
} from "../runtime/nodeExtensions/SubcomposeNodeExtension";
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
        public node: Node,
        public measurePolicy: MeasurePolicy | null
    ) { super(elements) }

    private placeChildren: (() => void) | null = null

    measure(constraints: Constraints): Placeable {
        if (this.node.extensions.has(SubconstraintsNodeExtensionKey)) {
            subconstraint(this.node, constraints, this.insert)
        }

        if (this.node.extensions.has(SubcomposeNodeExtensionKey)) {
            const measureResult = subcompose(this.node, constraints, this.insert)
            assertUInt(measureResult.width, measureResult.height)
            this.placed = true
            this.width = measureResult.width
            this.height = measureResult.height
            this.placeChildren = () => measureResult.placeChildren()
            return this
        }

        if (this.measurePolicy === null) {
            this.placed = false
            this.width = 0
            this.height = 0
            this.placeChildren = () => {}
            return this
        }

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.node.children, this.insert)
            .map(it => it.asMeasurable())

        const measureResult = this.measurePolicy.measure(childrenMeasurables, constraints)
        assertUInt(measureResult.width, measureResult.height)
        this.placed = false
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = () => measureResult.placeChildren()
        return this
    }

    minIntrinsicWidth(height: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.node.children, this.insert)
            .map(it => it.asMeasurable())

        return this.measurePolicy?.minIntrinsicWidth(childrenMeasurables, height)
    }

    maxIntrinsicWidth(height: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.node.children, this.insert)
            .map(it => it.asMeasurable())

        return this.measurePolicy?.maxIntrinsicWidth(childrenMeasurables, height)
    }

    minIntrinsicHeight(width: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.node.children, this.insert)
            .map(it => it.asMeasurable())

        return this.measurePolicy?.minIntrinsicHeight(childrenMeasurables, width)
    }

    maxIntrinsicHeight(width: number | null): number {
        if (this.measurePolicy === null)
            return 0

        const childrenMeasurables: Measurable[] = createChildrenLayoutNodes(this.node.children, this.insert)
            .map(it => it.asMeasurable())

        return this.measurePolicy?.maxIntrinsicHeight(childrenMeasurables, width)
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

    nextDrawLambda(canvas: TextCanvas): () => void {
        return () => {
            const childrenLayoutNodes = reuseChildrenLayoutNodes(this.node.children)
                // .sort((a, b) => a.z - b.z) todo

            for (const childrenLayoutNode of childrenLayoutNodes) {
                if (childrenLayoutNode.placed) {
                    canvas.save()
                    canvas.translate(this.x, this.y)
                    childrenLayoutNode.outerCoordinator.draw(canvas)
                    canvas.restore()
                }
            }
        }
    }
}

function subconstraint(node: Node, constraints: Constraints, insert: (block: () => void, node: Node) => void): void {
    const subconstraintsNodeExtension = node.extensions.get(SubconstraintsNodeExtensionKey) as SubconstraintsNodeExtension
    insert(() => {
        subconstraintsNodeExtension.compose(constraints)
    }, node)
}

function subcompose(node: Node, constraints: Constraints, insert: (block: () => void, node: Node) => void): MeasureResult {
    const subcomposeNodeExtension = node.extensions.get(SubcomposeNodeExtensionKey) as SubcomposeNodeExtension

    let measureResult: MeasureResult | undefined
    const subcomposes: { key: Key | null, node: Node }[] = []
    subcomposeNodeExtension.subcompose(constraints, {
        subcompose(key, content) {
            const node = new Node(null, new Modifier())
            subcomposes.push({ key, node })
            insert(content, node)

            node.children.forEach(({ node }) => {
                node.parent = null
            })

            return createChildrenLayoutNodes(node.children, insert)
                .map(it => it.asMeasurable())
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
            }, node)
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
