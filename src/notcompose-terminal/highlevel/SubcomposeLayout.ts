import {currentComposer} from "../../notcompose/runtime/currentComposer";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {Constraints, Measurable, MeasureResult} from "../runtime/layout/measure";
import {Key} from "../../notcompose/runtime/Composer";
import {
    SubcomposeNodeExtension,
    SubcomposeNodeExtensionKey,
    SubcomposeScope
} from "../runtime/nodeExtensions/SubcomposeNodeExtension";


export function SubcomposeLayout(content: (constraints: Constraints) => MeasureResult, modifier: Modifier = new Modifier()) {
    currentComposer().startNode(modifier)
    currentComposer().applyExtension(SubcomposeNodeExtensionKey, {
        subcompose(constraints, scope) {
            const previousScope = _scope
            _scope = scope
            const measureResult = content(constraints)
            _scope = previousScope
            scope.commit(measureResult)
        }
    } satisfies SubcomposeNodeExtension)
    currentComposer().endNode()
}

let _scope: SubcomposeScope | undefined

const Empty = Symbol()
export function subcompose(content: () => void): ReadonlyArray<Measurable>
export function subcompose(key: Key, content: () => void): ReadonlyArray<Measurable>
export function subcompose(key: Key | (() => void), content: (() => void) | typeof Empty = Empty): ReadonlyArray<Measurable> {
    if (_scope === undefined)
        throw new Error(`This function can be used only inside SubcomposeLayout`)
    const scope = _scope

    _scope = undefined
    if (content === Empty) {
        const measurables = scope.subcompose(null, key as (() => void))
        _scope = scope
        return measurables
    } else {
        const measurables = scope.subcompose(key as Key, content as (() => void))
        _scope = scope
        return measurables
    }
}
