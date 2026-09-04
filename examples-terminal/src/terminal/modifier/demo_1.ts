import { Modifier, setTerminalContent, Text } from '@notcompose/terminal'
import { Box, Column } from '@notcompose/layout'

setTerminalContent(() => {
    Column(() => {
        Box(() => {
            Text('Hello')
        }, Modifier
            .background('_')
            .padding({ horizontal: 2, vertical: 2 })
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .padding({ horizontal: 2, vertical: 2 })
            .background('_')
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .background('_')
            .padding({ horizontal: 2, vertical: 2 })
            .size(7)
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .size(7)
            .background('_')
            .padding({ horizontal: 2, vertical: 2 })
        )
    })
})


// Output:
// _________
// _________
// __Hello__
// _________
// _________
// -----------------------------------------
//
//
//   Hello
//
//
// -----------------------------------------
// ___________
// ___________
// __Hello____
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// -----------------------------------------
// _______
// _______
// __Hel__
// _______
// _______
// _______
// _______
