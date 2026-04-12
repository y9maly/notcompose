import {Constraints} from "../layout/measure.js";


export const SubconstraintsNodeExtensionKey = Symbol('SubconstraintsNodeExtensionKey')

export interface SubconstraintsNodeExtension {
    compose(constraints: Constraints): void
}
