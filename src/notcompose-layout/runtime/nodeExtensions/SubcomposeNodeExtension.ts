
import {Key} from "../../../notcompose/runtime/Composer";
import {Constraints} from "../Constraints";
import {Measurable, MeasureResult} from "../Measurable";
import {NodeExtensionKey} from "../../../notcompose/runtime/NodeExtensionKey";

export const SubcomposeNodeExtensionKey = new NodeExtensionKey<SubcomposeNodeExtension>('Subcompose')

export interface SubcomposeScope {
    subcompose(key: Key | null, content: () => void): ReadonlyArray<Measurable>
    commit(measureResult: MeasureResult): void
}

export interface SubcomposeNodeExtension {
    subcompose(constraints: Constraints, scope: SubcomposeScope): void
}
