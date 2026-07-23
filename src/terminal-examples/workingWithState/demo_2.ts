import { MutableState, mutableStateOf } from 'notcompose'
import { setTerminalContent, Text } from 'notcompose/terminal'
import { Box, Column } from 'notcompose/layout'

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
