import {fillMaxWidth, height, Spacer} from 'notcompose/layout'
import {background, Color} from 'notcompose/terminal'
import {elvis, Modifier} from 'notcompose'

export function Divider(symbol: string = '-', params?: {
    color?: Color | null
}) {
    const {color} = elvis(params, {
        color: null,
    })

    Spacer(Modifier
        .then(background(symbol, {color: color}))
        .then(fillMaxWidth())
        .then(height(1)),
    )
}
