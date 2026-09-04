import { Modifier, setTerminalContent } from '@notcompose/terminal'
import { RrtopScreen } from './rrtop/RrtopScreen.js'

setTerminalContent(() => {
    RrtopScreen(Modifier.fillMaxSize())
})
