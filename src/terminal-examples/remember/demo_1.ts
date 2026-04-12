import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {remember} from "../../notcompose/runtime-highlevel/remember";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";
import {input} from "../../notcompose-terminal/runtime/Input";
import {Key} from "../../notcompose/runtime-highlevel/Key";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Column} from "../../notcompose-terminal/highlevel/Column";


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
