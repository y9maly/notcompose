import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {MutableState} from "../../notcompose/runtime/State";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";
import {remember} from "../../notcompose/runtime-highlevel/remember";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {input} from "../../notcompose-terminal/runtime/Input";


const globalCounter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    globalCounter.value++
}, 5000)

setTerminalContent(() => {
    const localCounter = rememberState([globalCounter.value], () => 0)

    input((str) => {
        if (str === ' ')
            localCounter.value++
        return true
    })

    Text(`Local counter: ${localCounter.value}`)
})
