import {Constraints} from "../layout/Constraints";


export const SubconstraintsNodeExtensionKey = Symbol('SubconstraintsNodeExtensionKey')

export interface SubconstraintsNodeExtension {
    compose(constraints: Constraints): void
}
