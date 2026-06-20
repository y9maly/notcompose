import {setTerminalContent} from "notcompose/terminal";
import {Modifier} from "notcompose";
import {fillMaxSize} from "notcompose/layout";
import {CubeScreen} from "./cube/CubeScreen.js";

setTerminalContent(() => {
    CubeScreen(Modifier.then(fillMaxSize()))
})
