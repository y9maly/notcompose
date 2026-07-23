import { input, setTerminalContent, Text } from 'notcompose/terminal'
import { DisposableEffect, Key, mutableStateOf, remember, rememberState } from 'notcompose'
import { Column } from 'notcompose/layout'

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
