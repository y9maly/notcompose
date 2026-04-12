import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {DisposableEffect} from "../../notcompose/runtime-highlevel/DisposableEffect";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {NameElement, NameModifier} from "../../notcompose/runtime/modifiers/NameElement";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {remember} from "../../notcompose/runtime-highlevel/remember";
import {MutableState} from "../../notcompose/runtime/State";
import {input} from "../../notcompose-terminal/runtime/Input";
import {Box} from "../../notcompose-terminal/highlevel/Box";
import {Key} from "../../notcompose/runtime-highlevel/Key";
import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";


setTerminalContent(() => {
    DemoScreen()
})

function MainScreen(second: number) {
    const localSecond = rememberState(() => 0)

    DisposableEffect(() => {
        const interval = setInterval(() => { localSecond.value++ }, 500)
        return () => clearInterval(interval)
    })

    Column(() => {
        Text(`Global second: ${second}`)
        Text(`Local second: ${localSecond.value}`)
    }, new Modifier([new NameElement('MainScreenColumn')]))
}

function DetailsScreen(second: number) {
    const localSecond = rememberState(() => 0)

    DisposableEffect(() => {
        const interval = setInterval(() => { localSecond.value++ }, 500)
        return () => clearInterval(interval)
    })

    const consoleSize = rememberState(() => [process.stdout.columns, process.stdout.rows])
    const [width, height] = consoleSize.value

    DisposableEffect(() => {
        const listener = () => {
            consoleSize.value = [process.stdout.columns, process.stdout.rows]
        }
        process.stdout.on('resize', listener)
        return () => process.stdout.off('resize', listener)
    })

    Column(() => {
        Text(`Global second: ${second}`)
        Text(`Local second: ${localSecond.value}`)
        Text(`Console info:`)
        Text(`    Width: ${width}`)
        Text(`    Height: ${height}`)
    }, new Modifier([new NameElement('DetailsScreenColumn')]))
}

export function DemoScreen() {
    const frameCounterObject = remember(() => ({ counter: 1 }))
    const frameCounter = frameCounterObject.counter++

    const screen = remember(() => new MutableState<'Main' | 'Details'>('Main'))

    const command = remember(() => new MutableState(''))

    const second = rememberState(() => 0)

    DisposableEffect(() => {
        const interval = setInterval(() => { second.value++ }, 1000)
        return () => clearInterval(interval)
    })
    
    input((str, key) => {
        if (key) {
            if (key.name === 'backspace' || key.name === 'delete') {
                command.value = command.value.slice(0, -1)
                return true
            } else if (key.name === 'left') {
                screen.value = 'Main'
                return true
            } else if (key.name === 'right') {
                screen.value = 'Details'
                return true
            }
        }
        command.value += str
        return true
    })

    Column(() => {
        Text(`Frame ${frameCounter}`, new Modifier([NameModifier('Root/Column/Frame')]))
        Box(() => {
            Text(`Frame ${frameCounter}`)
            Text(`> ${command.value}`)
        }, new Modifier([NameModifier('Root/Column/Input')]))

        Text(`----------------------------`)
        if (screen.value === 'Main')
            Text("--- <Main> ---  Details  ---")
        else if (screen.value === 'Details')
            Text("---  Main  --- <Details> ---")
        Text(`----------------------------`)

        Key(screen.value, () => {
            if (screen.value === 'Main') {
                MainScreen(second.value)
            } else if (screen.value === 'Details') {
                DetailsScreen(second.value)
            }
        })
    }, new Modifier([NameModifier('Root/Column')]))
}
