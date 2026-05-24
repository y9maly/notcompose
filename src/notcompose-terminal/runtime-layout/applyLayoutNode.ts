import {NodeCoordinator} from "./NodeCoordinator.js";
import {InnerNodeCoordinator} from "./InnerNodeCoordinator.js";
import {LayoutModifier} from "../runtime/modifiers/LayoutModifier.js";
import {MeasurePolicyNodeExtensionKey} from "../runtime/nodeExtensions/MeasurePolicyNodeExtension.js";
import {LayoutModifierNodeCoordinator} from "./LayoutModifierNodeCoordinator.js";
import {Node} from "../../notcompose/runtime/Node";
import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";
import {LayoutNode} from "./LayoutNode";
import {LayoutNodeExtensionKey} from "../runtime/nodeExtensions/LayoutNodeExtension";

export function applyLayoutNode(
    node: Node,
    insert: (content: () => void, node: Node) => void,
): LayoutNode {
    // TODO reuse node coordinator

    const previousLayoutNode = node.extensions.get(LayoutNodeExtensionKey) as LayoutNode | undefined
    const measurePolicy = node.extensions.get(MeasurePolicyNodeExtensionKey) as MeasurePolicy | undefined

    const elements = []
    let layoutModifier: LayoutModifier | null = null
    let coordinator: NodeCoordinator | null = null

    for (let i = node.modifier.elements.length - 1; i >= 0; i--) {
        const element = node.modifier.elements[i]
        if (LayoutModifier.symbol in element) {
            if (coordinator === null) {
                coordinator = new InnerNodeCoordinator([...elements], insert, measurePolicy ?? null)
                elements.splice(0, elements.length)
            }

            if (layoutModifier !== null) {
                coordinator = new LayoutModifierNodeCoordinator([...elements], layoutModifier, coordinator)
                elements.splice(0, elements.length)
            }

            elements.unshift(element)
            layoutModifier = element[LayoutModifier.symbol] as LayoutModifier
        } else {
            elements.unshift(element)
        }
    }

    if (coordinator === null) {
        const measurePolicy = node.extensions.get(MeasurePolicyNodeExtensionKey) as MeasurePolicy | undefined
        coordinator = new InnerNodeCoordinator([...elements], insert, measurePolicy ?? null)
        elements.splice(0, elements.length)
    }

    if (layoutModifier !== null) {
        coordinator = new LayoutModifierNodeCoordinator([...elements], layoutModifier, coordinator)
        elements.splice(0, elements.length)
    }

    let layoutNode: LayoutNode
    if (previousLayoutNode !== undefined) {
        layoutNode = previousLayoutNode
        layoutNode.outerCoordinator = coordinator
    } else {
        layoutNode = new LayoutNode(node, coordinator, measurePolicy ?? null)
        node.extensions.set(LayoutNodeExtensionKey, layoutNode)
    }

    {
        let current = coordinator
        while (true) {
            current.layoutNode = layoutNode
            if (current instanceof LayoutModifierNodeCoordinator)
                current = current.nextCoordinator
            else
                break
        }
    }

    return layoutNode
}
