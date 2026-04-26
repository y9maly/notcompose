import {NodeCoordinator} from "./NodeCoordinator.js";
import {NodeCoordinatorExtensionKey} from "../runtime/nodeExtensions/NodeCoordinatorExtension.js";
import {InnerNodeCoordinator} from "./InnerNodeCoordinator.js";
import {LayoutModifier} from "../runtime/modifiers/LayoutModifier.js";
import {MeasurePolicyNodeExtensionKey} from "../runtime/nodeExtensions/MeasurePolicyNodeExtension.js";
import {LayoutModifierNodeCoordinator} from "./LayoutModifierNodeCoordinator.js";
import {Node} from "../../notcompose/runtime/Node";
import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";


export function applyNodeCoordinator(
    node: Node,
    insert: (content: () => void, node: Node) => void,
): NodeCoordinator {
    // TODO reuse node coordinator

    const elements = []
    let layoutModifier: LayoutModifier | null = null
    let coordinator: NodeCoordinator | null = null

    for (let i = node.modifier.elements.length - 1; i >= 0; i--) {
        const element = node.modifier.elements[i]
        if (LayoutModifier.symbol in element) {
            if (coordinator === null) {
                const measurePolicy = node.extensions.get(MeasurePolicyNodeExtensionKey) as MeasurePolicy | undefined
                coordinator = new InnerNodeCoordinator([...elements], insert, node, measurePolicy ?? null)
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
        coordinator = new InnerNodeCoordinator([...elements], insert, node, measurePolicy ?? null)
        elements.splice(0, elements.length)
    }

    if (layoutModifier !== null) {
        coordinator = new LayoutModifierNodeCoordinator([...elements], layoutModifier, coordinator)
        elements.splice(0, elements.length)
    }

    node.extensions.set(NodeCoordinatorExtensionKey, coordinator)
    return coordinator
}
