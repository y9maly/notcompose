import {input, setTerminalContent, Text} from "notcompose/terminal";
import {Key, mutableStateOf, remember} from "notcompose";
import {Column} from "notcompose/layout";

setTerminalContent(() => {
    const screen = remember(() => mutableStateOf(1))

    input((str) => {
        if (str === '1') {
            screen.value = 1
            return true
        } else if (str === '2') {
            screen.value = 2
            return true
        }

        return false
    })

    if (screen.value === 1) {
        Key('Screen 1', () => {
            Screen1()
        })
    }

    if (screen.value === 2) {
        Key('Screen 2', () => {
            Screen2()
        })
    }
})

function Screen1() {
    const screen1Counter = remember(() => mutableStateOf(0))

    input((str) => {
        if (str === ' ') {
            screen1Counter.value++
            return true
        }

        return false
    })

    Column(() => {
        Text('Screen 1')

        Text(`counter: ${screen1Counter.value}`)
    })
}

function Screen2() {
    Column(() => {
        Text('Screen 2')
    })
}
