import { setTerminalContent, Text } from '@notcompose/terminal'
import { MutableState, mutableStateOf } from '@notcompose/core'

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
