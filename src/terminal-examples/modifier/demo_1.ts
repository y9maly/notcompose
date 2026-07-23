import { background, setTerminalContent, Text } from 'notcompose/terminal'
import { Box, Column, padding, size } from 'notcompose/layout'
import { Modifier } from 'notcompose'

setTerminalContent(() => {
    Column(() => {
        Box(() => {
            Text('Hello')
        }, Modifier
            .then(background('_'))
            .then(padding({ horizontal: 2, vertical: 2 }))
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .then(padding({ horizontal: 2, vertical: 2 }))
            .then(background('_'))
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .then(background('_'))
            .then(padding({ horizontal: 2, vertical: 2 }))
            .then(size(7))
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .then(size(7))
            .then(background('_'))
            .then(padding({ horizontal: 2, vertical: 2 }))
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
