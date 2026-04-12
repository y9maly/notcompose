import {setTerminalContent} from "../notcompose-terminal/setTerminalContent";
import {FileExplorerScreen} from "./fileExplorer/FileExplorerScreen";
import {Modifier} from "../notcompose/runtime/Modifier";
import {FillMaxSizeModifier} from "../notcompose-terminal/runtime/modifiers/FillModifier";


setTerminalContent(() => {
    FileExplorerScreen(new Modifier([FillMaxSizeModifier()]))
})
