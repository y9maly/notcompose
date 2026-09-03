import { currentComposer, Modifier, NameModifier } from '@notcompose/core'
import { type SubcomposeNodeExtension, SubcomposeNodeExtensionKey, type SubcomposeScope } from '../runtime/nodeExtensions/SubcomposeNodeExtension.js'
import { Constraints } from '../runtime/Constraints.js'
import { type Measurable, MeasureResult } from '../runtime/Measurable.js'

export function SubcomposeLayout(content: (constraints: Constraints) => MeasureResult, modifier: Modifier = Modifier) {
    currentComposer().startNode(modifier.then(NameModifier('SubcomposeLayout')))
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

export function subcompose(content: () => void): ReadonlyArray<Measurable>
export function subcompose(key: string | number | boolean, content: () => void): ReadonlyArray<Measurable>
export function subcompose(key: string | number | boolean | (() => void), content?: () => void): ReadonlyArray<Measurable> {
    if (_scope === undefined)
        throw new Error(`This function can be used only inside SubcomposeLayout`)
    const scope = _scope

    _scope = undefined
    if (arguments.length === 2) {
        const measurables = scope.subcompose(key as string | number | boolean, content! satisfies (() => void))
        _scope = scope
        return measurables
    } else {
        const measurables = scope.subcompose(null, key as (() => void))
        _scope = scope
        return measurables
    }
}
