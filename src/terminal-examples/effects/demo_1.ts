import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {remember} from "../../notcompose/runtime-highlevel/remember";
import {mutableStateOf} from "../../notcompose/runtime-highlevel/mutableStateOf";
import {input} from "../../notcompose-terminal/runtime/Input";
import {Key} from "../../notcompose/runtime-highlevel/Key";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {LaunchedEffect} from "../../notcompose/runtime-highlevel/LaunchedEffect";


const screen1LaunchedEffectCounter = mutableStateOf(0)

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
        Text(`screen1LaunchedEffectCounter: ${screen1LaunchedEffectCounter.value}`)

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
    LaunchedEffect(() => {
        screen1LaunchedEffectCounter.value++
    })

    Column(() => {
        Text('Screen 1')
    })
}

function Screen2() {
    Column(() => {
        Text('Screen 2')
    })
}