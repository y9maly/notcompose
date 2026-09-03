import type { Key } from '../../../notcompose/runtime/Composer.js'
import { Constraints } from '../Constraints.js'
import { type Measurable, MeasureResult } from '../Measurable.js'
import { NodeExtensionKey } from 'notcompose'

export const SubcomposeNodeExtensionKey = new NodeExtensionKey<SubcomposeNodeExtension>('Subcompose')

export interface SubcomposeScope {
    subcompose(key: Key | null, content: () => void): ReadonlyArray<Measurable>
    commit(measureResult: MeasureResult): void
}

export interface SubcomposeNodeExtension {
    subcompose(constraints: Constraints, scope: SubcomposeScope): void
}
