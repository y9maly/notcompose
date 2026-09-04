import { setTerminalContent, Text } from '@notcompose/terminal'
import { MutableState, mutableStateOf, remember } from '@notcompose/core'

const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

setTerminalContent(() => {
    const date = remember([counter.value], () => Date.now())

    Text(`Now date: ${date}`)
})
