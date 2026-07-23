import {Alignment, Box} from 'notcompose/layout'
import {Modifier} from 'notcompose'
import {Text} from 'notcompose/terminal'
import {Divider} from './Divider.js'

export function ExampleHeader(text: string) {
    Box(() => {
        Divider()
        Text(text)
    }, Modifier, {
        alignment: Alignment.Center
    })
}
