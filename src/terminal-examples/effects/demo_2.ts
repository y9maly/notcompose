import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";
import {remember} from "../../notcompose/runtime-highlevel/remember";
import {input} from "../../notcompose-terminal/runtime/Input";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Key} from "../../notcompose/runtime-highlevel/Key";
import {DisposableEffect} from "../../notcompose/runtime-highlevel/DisposableEffect";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";


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

    Column(() => {
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
})

function Screen1() {
    const localCounter = rememberState(() => 0)

    DisposableEffect(() => {
        const interval = setInterval(() => {
            localCounter.value++
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    })

    Column(() => {
        Text('Screen 1')
        Text(`localCounter ${localCounter.value}`)
    })
}

function Screen2() {
    Column(() => {
        Text('Screen 2')
    })
}
