import { Layout } from '../runtime/Layout.js'
import { Modifier, NameModifier } from 'notcompose'
import { EmptyMeasurePolicy } from './Empty.js'

export function Spacer(modifier: Modifier = Modifier) {
    Layout(() => {}, EmptyMeasurePolicy, modifier.then(NameModifier('Spacer')))
}
