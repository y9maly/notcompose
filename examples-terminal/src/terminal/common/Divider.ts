import { Spacer } from '@notcompose/layout'
import { Color, Modifier } from '@notcompose/terminal'
import { elvis } from '@notcompose/core'

export function Divider(symbol: string = '-', params?: {
    color?: Color | null
}) {
    const { color } = elvis(params, {
        color: null,
    })

    Spacer(Modifier
        .background(symbol, { color: color })
        .fillMaxWidth()
        .height(1),
    )
}
