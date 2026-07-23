import { setTerminalContent } from 'notcompose/terminal'
import { Modifier } from 'notcompose'
import { fillMaxSize } from 'notcompose/layout'
import { CounterScreen } from './counter/CounterScreen.js'

setTerminalContent(() => {
    CounterScreen(Modifier.then(fillMaxSize()))
})
