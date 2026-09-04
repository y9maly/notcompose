import type { Item } from './utils.js'
import { DisposableEffect, Modifier, rememberState } from '@notcompose/core'
import { Row } from '@notcompose/layout'
import { Text } from '@notcompose/terminal'

export function ListItem(
    item: Item,
    isSelected: boolean,
    modifier: Modifier = Modifier,
) {
    const cursor = rememberState<string>(() => '  ')
    const icon = item.filename === '..' ? `🔙` : (item.isDirectory ? `📁` : `📄`)

    DisposableEffect([isSelected], () => {
        if (!isSelected) {
            cursor.value = '  '
            return
        }

        let counter = 0
        cursor.value = '▶ '
        const interval = setInterval(() => {
            if (counter++ % 2 === 0) {
                cursor.value = ` ▶`
            } else {
                cursor.value = `▶ `
            }
        }, 750)

        return () => {
            clearInterval(interval)
        }
    })

    Row(() => {
        Text(` ${cursor.value} `)
        Text(`${icon} `)

        if (isSelected) {
            Text(`[ ${item.filename} ]`)
        } else {
            Text(`  ${item.filename}`)
        }
    }, modifier)
}
