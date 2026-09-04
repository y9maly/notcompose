import { currentComposer } from '@notcompose/core'
import { Modifier } from '../TerminalModifier.js'

export function input(read: (str: string, key: any) => boolean) {
    currentComposer().startNode(Modifier.handleInput(read))
    currentComposer().endNode()
}
