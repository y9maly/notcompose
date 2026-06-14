import {setTerminalContent} from "notcompose/terminal";
import {Modifier} from "notcompose";
import {FillMaxSizeModifier} from "notcompose/layout";
import {CounterScreen} from "./counter/CounterScreen.js";

setTerminalContent(() => {
    CounterScreen(new Modifier([FillMaxSizeModifier()]))
})
