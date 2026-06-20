import {setTerminalContent} from "notcompose/terminal";
import {FileExplorerScreen} from "./fileExplorer/FileExplorerScreen.js";
import {Modifier} from "notcompose";
import {fillMaxSize} from "notcompose/layout";

setTerminalContent(() => {
    FileExplorerScreen(Modifier.then(fillMaxSize()))
})
