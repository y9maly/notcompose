import {setTerminalContent} from "notcompose/terminal";
import {FileExplorerScreen} from "./fileExplorer/FileExplorerScreen.js";
import {Modifier} from "notcompose";
import {FillMaxSizeModifier} from "notcompose/layout";

setTerminalContent(() => {
    FileExplorerScreen(new Modifier([FillMaxSizeModifier()]))
})
