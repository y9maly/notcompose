import {setTerminalContent} from "../notcompose-terminal/setTerminalContent";
import {Modifier} from "../notcompose/runtime/Modifier";
import {FillMaxSizeModifier} from "../notcompose-terminal/runtime/modifiers/FillModifier";
import {RrtopScreen} from "./rrtop/RrtopScreen";


setTerminalContent(() => {
    RrtopScreen(new Modifier([FillMaxSizeModifier()]))
})
