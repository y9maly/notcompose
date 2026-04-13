import {NodeCoordinator} from "./NodeCoordinator.js";
import {Constraints, Measurable, MeasurePolicy, MeasureResult, Placeable} from "../runtime/layout/measure.js";
import {MeasurePolicyNodeExtensionKey} from "../runtime/nodeExtensions/MeasurePolicyNodeExtension.js";
import {applyNodeCoordinator} from "./applyNodeCoordinator.js";
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
import {assertInt} from "../../notcompose/utils/assertInt";


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
            assertInt(measureResult.width, measureResult.height)
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

        const childrenMeasurables: Measurable[] = childrenNodeCoordinators(this.node.children, this.insert)

        const measureResult = this.measurePolicy.measure(childrenMeasurables, constraints)
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

            return childrenNodeCoordinators(node.children, insert)
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
    assertInt(measureResult.width, measureResult.height)
    return measureResult
}

function childrenNodeCoordinators(
    children: ReadonlyArray<{ key: Key | null, node: Node }>,
    insert: (block: () => void, node: Node) => void
): NodeCoordinator[] {
    const result: NodeCoordinator[] = []

    const queue = children.map(it => it.node)
    while (queue.length > 0) {
        const node = queue.shift()!

        if (node.extensions.has(MeasurePolicyNodeExtensionKey) || node.extensions.has(SubcomposeNodeExtensionKey)) {
            // Если нода умеет распологать детей - добавить её как дочерний coordinator
            // Если дерево ещё не построено, то [coordinator] достроит его сам.
            const coordinator = applyNodeCoordinator(node, insert)
            result.push(coordinator)
        } else {
            // Если нода НЕ умеет распологать детей - добавить её детей напрямую
            queue.unshift(...node.children.map(it => it.node))
        }
    }

    return result
}
