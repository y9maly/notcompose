import { drawText } from '../runtime/modifiers/TextModifier.js'
import { EmptyMeasurePolicy, Layout } from '@notcompose/layout'
import { Modifier, NameModifier } from '@notcompose/core'
import { AnnotatedString } from '../runtime/ui/AnnotatedString.js'

export function Text(text: string | AnnotatedString, modifier: Modifier = Modifier) {
    Layout(() => {}, EmptyMeasurePolicy, modifier.then(drawText(text), NameModifier('Text')))
}
