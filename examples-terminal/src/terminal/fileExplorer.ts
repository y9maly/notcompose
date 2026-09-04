import { Modifier, setTerminalContent } from '@notcompose/terminal'
import { FileExplorerScreen } from './fileExplorer/FileExplorerScreen.js'

setTerminalContent(() => {
    FileExplorerScreen(Modifier.fillMaxSize())
})
