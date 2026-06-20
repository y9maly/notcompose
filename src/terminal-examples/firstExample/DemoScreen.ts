import {
    DisposableEffect,
    Key,
    Modifier,
    MutableState,
    NameElement,
    NameModifier,
    remember,
    rememberState
} from "notcompose";
import {Box, Column} from "notcompose/layout";
import {input, setTerminalContent, Text} from "notcompose/terminal";

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
    }, Modifier
        .then(NameModifier('MainScreenColumn')) // debug information
    )
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
    }, Modifier
        .then(NameModifier('DetailsScreenColumn'))
    )
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
        Text(`Frame ${frameCounter}`, Modifier.then(NameModifier('Root/Column/Frame')))
        Box(() => {
            Text(`Frame ${frameCounter}`)
            Text(`> ${command.value}`)
        }, Modifier.then(NameModifier('Root/Column/Input')))

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
    }, Modifier.then(NameModifier('Root/Column')))
}
