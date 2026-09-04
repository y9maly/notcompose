import { input, setTerminalContent, Text } from '@notcompose/terminal'
import { MutableState, mutableStateOf, rememberState } from '@notcompose/core'

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
