import {Node} from "../../../notcompose/runtime/Node";
import {LayoutNode, LayoutNodeExtensionKey} from "./LayoutNode";
import {MeasurePolicyExtensionKey} from "../nodeExtensions/MeasurePolicyNodeExtension";
import {EmptyMeasurePolicy} from "../../highlevel/Empty";
import {LayoutModifierLayoutNodeCoordinator} from "./LayoutModifierLayoutNodeCoordinator";
import {LayoutModifier} from "../modifiers/LayoutModifier";
import {InnerLayoutNodeCoordinator} from "./InnerLayoutNodeCoordinator";
import {LayoutNodeCoordinator} from "./LayoutNodeCoordinator";
import {MeasurePolicy} from "../MeasurePolicy";

export function applyLayoutNode(node: Node): LayoutNode {
    const layoutNode = node.getExtension(LayoutNodeExtensionKey)
    if (layoutNode === undefined) {
        const layoutNode = createLayoutNode(node)
        node.setExtension(LayoutNodeExtensionKey, layoutNode)
        return layoutNode
    } else {
        updateLayoutNode(node, layoutNode)
        return layoutNode
    }
}

function createLayoutNode(node: Node): LayoutNode {
    const measurePolicy = node.getExtension(MeasurePolicyExtensionKey) ?? EmptyMeasurePolicy
    const outerCoordinator = applyOuterCoordinator(node, measurePolicy)

    return new LayoutNode(node, outerCoordinator, measurePolicy)
}

function updateLayoutNode(node: Node, layoutNode: LayoutNode) {
    const measurePolicy = node.getExtension(MeasurePolicyExtensionKey) ?? EmptyMeasurePolicy
    const outerCoordinator = applyOuterCoordinator(node, measurePolicy)

    layoutNode.updateMeasurePolicy(measurePolicy)
    layoutNode.updateOuterCoordinator(outerCoordinator)
}

function applyOuterCoordinator(node: Node, innerMeasurePolicy: MeasurePolicy): LayoutNodeCoordinator {
    // TODO reuse node coordinator

    const elements = []
    let layoutModifier: LayoutModifier | null = null
    let coordinator: LayoutNodeCoordinator | null = null

    for (let i = node.modifier.elements.length - 1; i >= 0; i--) {
        const element = node.modifier.elements[i]
        if (LayoutModifier.symbol in element) {
            if (coordinator === null) {
                coordinator = new InnerLayoutNodeCoordinator(node, [...elements], innerMeasurePolicy)
                elements.splice(0, elements.length)
            }

            if (layoutModifier !== null) {
                coordinator = new LayoutModifierLayoutNodeCoordinator([...elements], layoutModifier, coordinator)
                elements.splice(0, elements.length)
            }

            elements.unshift(element)
            layoutModifier = element[LayoutModifier.symbol] as LayoutModifier
        } else {
            elements.unshift(element)
        }
    }

    if (coordinator === null) {
        coordinator = new InnerLayoutNodeCoordinator(node, [...elements], innerMeasurePolicy)
        elements.splice(0, elements.length)
    }

    if (layoutModifier !== null) {
        coordinator = new LayoutModifierLayoutNodeCoordinator([...elements], layoutModifier, coordinator)
        elements.splice(0, elements.length)
    }

    return coordinator
}
