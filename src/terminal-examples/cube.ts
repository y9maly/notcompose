import {setTerminalContent} from "../notcompose-terminal/setTerminalContent";
import {Modifier} from "../notcompose/runtime/Modifier";
import {FillMaxSizeModifier} from "../notcompose-terminal/runtime/modifiers/FillModifier";
import {CubeScreen} from "./cube/CubeScreen";


setTerminalContent(() => {
    CubeScreen(new Modifier([FillMaxSizeModifier()]))
})
