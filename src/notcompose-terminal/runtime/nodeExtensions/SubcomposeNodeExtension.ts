
import {Key} from "../../../notcompose/runtime/Composer";
import {Constraints} from "../layout/Constraints";
import {Measurable, MeasureResult} from "../layout/Measurable";


export const SubcomposeNodeExtensionKey = Symbol('SubcomposeNodeExtensionKey')

export interface SubcomposeScope {
    subcompose(key: Key | null, content: () => void): ReadonlyArray<Measurable>
    commit(measureResult: MeasureResult): void
}

export interface SubcomposeNodeExtension {
    subcompose(constraints: Constraints, scope: SubcomposeScope): void
}
