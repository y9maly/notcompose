import {Modifier} from "notcompose";
import {Column, offset} from "notcompose/layout";
import {Color, colored, setTerminalContent, Text} from "notcompose/terminal";

setTerminalContent(() => {
    Column(() => {
        Text("Try to write your code here!")
        Text(colored(Color.Red, './src/main.ts'))
    }, Modifier.then(offset(2, 1)))
})
