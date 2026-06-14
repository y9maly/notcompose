import {Modifier} from "notcompose";
import {Column, OffsetModifier} from "notcompose/layout";
import {Color, colored, setTerminalContent, Text} from "notcompose/terminal";

setTerminalContent(() => {
    Column(() => {
        Text("Try to write your code here!")
        Text(colored(Color.Red, './src/main.ts'))
    }, new Modifier([OffsetModifier(2, 1)]))
})
