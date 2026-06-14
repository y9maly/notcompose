import {setTerminalContent} from "notcompose/terminal";
import {Modifier} from "notcompose";
import {FillMaxSizeModifier} from "notcompose/layout";
import {CubeScreen} from "./cube/CubeScreen.js";

setTerminalContent(() => {
    CubeScreen(new Modifier([FillMaxSizeModifier()]))
})
