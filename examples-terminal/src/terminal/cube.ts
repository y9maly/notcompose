import { Modifier, setTerminalContent } from '@notcompose/terminal'
import { CubeScreen } from './cube/CubeScreen.js'

setTerminalContent(() => {
    CubeScreen(Modifier.fillMaxSize())
})
