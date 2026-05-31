import {Constraints} from "../Constraints";
import {NodeExtensionKey} from "../../../notcompose/runtime/NodeExtensionKey";

export const SubconstraintsNodeExtensionKey = new NodeExtensionKey<SubconstraintsNodeExtension>('Subconstraints')

export interface SubconstraintsNodeExtension {
    compose(constraints: Constraints): void
}
