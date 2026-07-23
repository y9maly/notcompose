import { setTerminalContent } from 'notcompose/terminal'
import { Modifier } from 'notcompose'
import { fillMaxSize } from 'notcompose/layout'
import { RrtopScreen } from './rrtop/RrtopScreen.js'

setTerminalContent(() => {
    RrtopScreen(Modifier.then(fillMaxSize()))
})
