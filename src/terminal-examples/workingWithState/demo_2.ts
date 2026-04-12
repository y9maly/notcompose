import {MutableState} from "../../notcompose/runtime/State";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";
import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Box} from "../../notcompose-terminal/highlevel/Box";


const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

let rootFrames = 0
let columnFrames = 0
let boxFrames = 0
setTerminalContent(() => { /* root composable lambda */
    rootFrames++

    Column(() => {
        columnFrames++

        Text(`root frames: ${rootFrames}`)
        Text(`column frames: ${columnFrames}`)

        Box(() => {
            boxFrames++

            // state read
            counter.value

            Text(`box frames: ${boxFrames}`)
        })
    })
})

// Output

// root frames: 1
// column frames: 1
// box frames: 1

// root frames: 1
// column frames: 1
// box frames: 2

// root frames: 1
// column frames: 1
// box frames: 3

// root frames: 1
// column frames: 1
// box frames: 4

// root frames: 1
// column frames: 1
// box frames: 5
