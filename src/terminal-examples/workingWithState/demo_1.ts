import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {MutableState} from "../../notcompose/runtime/State";


const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

let frames = 0
setTerminalContent(() => { /* root composable lambda */
    frames++

    Text(`counter ${counter.value} (frame ${frames})`)
})

// Output:
// counter 1 (frame 1)
// counter 2 (frame 2)
// counter 3 (frame 3)
// counter 4 (frame 4)
// ...
