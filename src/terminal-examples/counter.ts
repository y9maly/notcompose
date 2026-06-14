import {setTerminalContent} from "../notcompose-terminal/setTerminalContent";
import {Modifier} from "../notcompose/runtime/Modifier";
import {FillMaxSizeModifier} from "../notcompose-layout/runtime/modifiers/FillModifier";
import {CounterScreen} from "./counter/CounterScreen";

setTerminalContent(() => {
    CounterScreen(new Modifier([FillMaxSizeModifier()]))
})
