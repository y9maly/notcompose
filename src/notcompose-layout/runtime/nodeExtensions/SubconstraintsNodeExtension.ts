import { Constraints } from '../Constraints.js'
import { NodeExtensionKey } from 'notcompose'

export const SubconstraintsNodeExtensionKey = new NodeExtensionKey<SubconstraintsNodeExtension>('Subconstraints')

export interface SubconstraintsNodeExtension {
    compose(constraints: Constraints): void
}
