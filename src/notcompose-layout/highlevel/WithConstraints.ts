import { MeasurePolicyExtensionKey } from '../runtime/nodeExtensions/MeasurePolicyNodeExtension.js'
import { BoxMeasurePolicy } from './Box.js'
import { type SubconstraintsNodeExtension, SubconstraintsNodeExtensionKey } from '../runtime/nodeExtensions/SubconstraintsNodeExtension.js'
import { ColumnMeasurePolicy } from './Column.js'
import { RowMeasurePolicy } from './Row.js'
import { currentComposer, Modifier, NameModifier } from 'notcompose'
import { Alignment, HorizontalAlignment, VerticalAlignment } from '../runtime/core/Alignment.js'
import { Constraints } from '../runtime/Constraints.js'
import { MeasurePolicy } from '../runtime/MeasurePolicy.js'

export function BoxWithConstraints(
    content: (constraints: Constraints) => void,
    modifier: Modifier = Modifier,
    params?: {
        alignment?: Alignment
    }
) {
    LayoutWithConstraints(content, BoxMeasurePolicy(params?.alignment), modifier.then(NameModifier('BoxWithConstraints')))
}

export function ColumnWithConstraints(
    content: (constraints: Constraints) => void,
    modifier: Modifier = Modifier,
    params?: {
        horizontalAlignment?: HorizontalAlignment
    }
) {
    LayoutWithConstraints(content, ColumnMeasurePolicy(params?.horizontalAlignment), modifier.then(NameModifier('ColumnWithConstraints')))
}

export function RowWithConstraints(
    content: (constraints: Constraints) => void,
    modifier: Modifier = Modifier,
    params?: {
        verticalAlignment?: VerticalAlignment
    }
) {
    LayoutWithConstraints(content, RowMeasurePolicy(params?.verticalAlignment), modifier.then(NameModifier('RowWithConstraints')))
}

export function LayoutWithConstraints(
    content: (constraints: Constraints) => void,
    policy: MeasurePolicy,
    modifier: Modifier,
) {
    currentComposer().startNode(modifier.then(NameModifier('LayoutWithConstraints')))
    currentComposer().applyExtension(MeasurePolicyExtensionKey, policy)
    currentComposer().applyExtension(SubconstraintsNodeExtensionKey, {
        compose(constraints: Constraints) {
            content(constraints)
        }
    } satisfies SubconstraintsNodeExtension)
    currentComposer().endNode()
}
