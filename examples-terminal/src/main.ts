import { Color, colored, Modifier, setTerminalContent, Text } from '@notcompose/terminal'
import { Column } from '@notcompose/layout'

setTerminalContent(() => {
    Column(() => {
        Text('Try to write your code here!')
        Text(colored(Color.Red, './src/main.ts'))
    }, Modifier.offset(2, 1))
})
