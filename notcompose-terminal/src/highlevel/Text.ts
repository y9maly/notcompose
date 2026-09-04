import { EmptyMeasurePolicy, Layout } from '@notcompose/layout'
import { NameModifier } from '@notcompose/core'
import { Modifier } from '@notcompose/terminal'
import { AnnotatedString } from '../runtime/ui/AnnotatedString.js'

export function Text(text: string | AnnotatedString, modifier: Modifier = Modifier) {
    Layout(() => {}, EmptyMeasurePolicy, Modifier(modifier).drawText(text).then(NameModifier('Text')))
}
