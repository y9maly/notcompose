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


export class InnerNodeCoordinator extends NodeCoordinator {
    constructor(
        elements: ModifierElement[],
        public insert: (content: () => void, node: Node) => void,
        public node: Node,
        public measurePolicy: MeasurePolicy | null
    ) { super(elements) }

    private placeChildren: (() => void) | null = null

    measure(constraints: Constraints): Placeable {
        const thisCoordinator = this

        if (this.node.extensions.has(SubconstraintsNodeExtensionKey)) {
            const subconstraintsNodeExtension = this.node.extensions.get(SubconstraintsNodeExtensionKey) as SubconstraintsNodeExtension
            thisCoordinator.insert(() => {
                subconstraintsNodeExtension.compose(constraints)
            }, this.node)
        }

        if (this.node.extensions.has(SubcomposeNodeExtensionKey)) {
            const subcomposeNodeExtension = this.node.extensions.get(SubcomposeNodeExtensionKey) as SubcomposeNodeExtension

            let measureResult: MeasureResult | undefined
            const subcomposes: { key: Key | null, node: Node }[] = []
            subcomposeNodeExtension.subcompose(constraints, {
                subcompose(key, content) {
                    const node = new Node(null, new Modifier())
                    subcomposes.push({ key, node })
                    thisCoordinator.insert(content, node)

                    node.children.forEach(({ node }) => {
                        node.parent = null
                    })

                    return node.children.map(({node}) => ({
                        measure(constraints) {
                            return applyNodeCoordinator(node, thisCoordinator.insert).measure(constraints)
                        }
                    } satisfies Measurable))
                },

                commit(_measureResult) {
                    measureResult = _measureResult
                    thisCoordinator.insert(() => {
                        subcomposes.forEach(({ key, node }) => {
                            if (key === null)
                                currentComposer().insertNode(node)
                            else
                                currentComposer().insertNode(node, key)

                            currentComposer().endNode()
                        })

                        subcomposes.length = 0
                    }, thisCoordinator.node)
                }
            } satisfies SubcomposeScope)

            if (measureResult === undefined)
                throw new Error(`'commit' must be called`)
            if (isNaN(measureResult.width)) throw new Error('width is NaN')
            if (isNaN(measureResult.height)) throw new Error('height is NaN')
            if (!Number.isInteger(measureResult.width)) throw new Error('width is not an integer')
            if (!Number.isInteger(measureResult.width)) throw new Error('height is not an integer')
            this.placed = false
            this.width = measureResult.width
            this.height = measureResult.height
            this.placeChildren = () => measureResult!.placeChildren()
            return this
        }

        if (this.measurePolicy === null) {
            this.placed = false
            this.width = 0
            this.height = 0
            this.placeChildren = () => {}
            return this
        }

        const childrenMeasurables: Measurable[] = []; {
            const queue = this.node.children.map(it => it.node)
            while (queue.length > 0) {
                const node = queue.shift()!

                if (node.extensions.has(MeasurePolicyNodeExtensionKey) || node.extensions.has(SubcomposeNodeExtensionKey)) {
                    // Если нода умеет распологать детей - добавить её как дочерний coordinator
                    // Если дерево ещё не построено, то [coordinator] достроит его сам.
                    const coordinator = applyNodeCoordinator(node, this.insert)
                    childrenMeasurables.push(coordinator)
                } else {
                    // Если нода НЕ умеет распологать детей - добавить её детей напрямую
                    queue.unshift(...node.children.map(it => it.node))
                }
            }
        }

        const measureResult = this.measurePolicy.measure(childrenMeasurables, constraints)
        if (isNaN(measureResult.width)) throw new Error('width is NaN')
        if (isNaN(measureResult.height)) throw new Error('height is NaN')
        if (!Number.isInteger(measureResult.width)) throw new Error('width is not an integer')
        if (!Number.isInteger(measureResult.width)) throw new Error('height is not an integer')
        this.placed = false
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = () => measureResult.placeChildren()
        return this
    }

    place(x: number, y: number) {
        if (isNaN(x)) throw new Error('x is NaN')
        if (isNaN(y)) throw new Error('y is NaN')
        if (!Number.isInteger(x)) throw new Error('x is not an integer')
        if (!Number.isInteger(y)) throw new Error('y is not an integer')

        this.placed = true
        this.x = x
        this.y = y
        if (this.placeChildren === null)
            throw new Error(`Must be unreachable. [place] cannot be invoked before [measure].`)
        this.placeChildren()
    }
}
