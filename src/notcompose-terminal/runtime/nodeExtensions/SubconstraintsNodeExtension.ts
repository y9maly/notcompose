import {Constraints} from "../layout/Constraints";
import {NodeExtensionKey} from "../../../notcompose/runtime/NodeExtensionKey";

export const SubconstraintsNodeExtensionKey = new NodeExtensionKey<SubconstraintsNodeExtension>('Subconstraints')

export interface SubconstraintsNodeExtension {
    compose(constraints: Constraints): void
}
