import { Modifier, setTerminalContent } from '@notcompose/terminal'
import { CounterScreen } from './counter/CounterScreen.js'

setTerminalContent(() => {
    CounterScreen(Modifier.fillMaxSize())
})
