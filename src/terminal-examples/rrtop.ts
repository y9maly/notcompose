import {setTerminalContent} from "notcompose/terminal";
import {Modifier} from "notcompose";
import {FillMaxSizeModifier} from "notcompose/layout";
import {RrtopScreen} from "./rrtop/RrtopScreen.js";

setTerminalContent(() => {
    RrtopScreen(new Modifier([FillMaxSizeModifier()]))
})
