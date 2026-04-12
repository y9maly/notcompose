import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {MutableState} from "../../notcompose/runtime/State";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";
import {remember} from "../../notcompose/runtime-highlevel/remember";
import {Text} from "../../notcompose-terminal/highlevel/Text";


const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

setTerminalContent(() => {
    const date = remember([counter.value], () => Date.now())

    Text(`Now date: ${date}`)
})
