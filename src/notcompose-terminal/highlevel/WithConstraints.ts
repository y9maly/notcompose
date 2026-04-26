import {MeasurePolicyNodeExtensionKey} from "../runtime/nodeExtensions/MeasurePolicyNodeExtension.js";
import {BoxMeasurePolicy} from "./Box.js";
import {
    SubconstraintsNodeExtension,
    SubconstraintsNodeExtensionKey
} from "../runtime/nodeExtensions/SubconstraintsNodeExtension.js";
import {ColumnMeasurePolicy} from "./Column.js";
import {RowMeasurePolicy} from "./Row.js";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {currentComposer} from "../../notcompose/runtime/currentComposer";
import {Alignment, HorizontalAlignment, VerticalAlignment} from "../runtime/ui/Alignment";
import {Constraints} from "../runtime/layout/Constraints";
import {MeasurePolicy} from "../runtime/layout/MeasurePolicy";


export function BoxWithConstraints(
    content: (constraints: Constraints) => void,
    modifier: Modifier = new Modifier(),
    params?: {
        alignment?: Alignment,
    }
) {
    LayoutWithConstraints(content, BoxMeasurePolicy(params?.alignment), modifier)
}

export function ColumnWithConstraints(
    content: (constraints: Constraints) => void,
    modifier: Modifier = new Modifier(),
    params?: {
        horizontalAlignment?: HorizontalAlignment,
    }
) {
    LayoutWithConstraints(content, ColumnMeasurePolicy(params?.horizontalAlignment), modifier)
}

export function RowWithConstraints(
    content: (constraints: Constraints) => void,
    modifier: Modifier = new Modifier(),
    params?: {
        verticalAlignment?: VerticalAlignment,
    }
) {
    LayoutWithConstraints(content, RowMeasurePolicy(params?.verticalAlignment), modifier)
}

export function LayoutWithConstraints(
    content: (constraints: Constraints) => void,
    policy: MeasurePolicy,
    modifier: Modifier,
) {
    currentComposer().startNode(modifier)
    currentComposer().applyExtension(MeasurePolicyNodeExtensionKey, policy)
    currentComposer().applyExtension(SubconstraintsNodeExtensionKey, {
        compose(constraints: Constraints) {
            content(constraints)
        }
    } satisfies SubconstraintsNodeExtension)
    currentComposer().endNode()
}
