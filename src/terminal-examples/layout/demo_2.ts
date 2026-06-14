import {setTerminalContent, Text} from "notcompose/terminal";
import {Column, ColumnWithConstraints, Constraints, Row} from "notcompose/layout";

setTerminalContent(() => {
    ColumnWithConstraints((constraints: Constraints) => {
        Text(`Ширина терминала: ${constraints.maxWidth}`)
        Text(`Высота терминала: ${constraints.maxHeight}`)

        // In our case `constraints.maxWidth` will never be null.
        // But in some cases it is useful to catch this.
        if (constraints.maxWidth === null || constraints.maxWidth > 70) {
            LargeScreen()
        } else {
            SmallScreen()
        }
    })
})

function LargeScreen() {
    Row(() => {
        Text('Это вёрстка для широкого экрана')
        Text(' | ')
        Text('Сюда влезет много широкого контента')
    })
}

function SmallScreen() {
    Column(() => {
        Text('Это вёрстка для маленького экрана')
        Text('')
        Text('Сюда не влезет много контента')
    })
}

// Output if terminal width less than 70:
// Ширина терминала: 42
// Высота терминала: 35
// Это вёрстка для маленького экрана
//
// Сюда не влезет много контента

// Output if terminal width more than 70:
// Ширина терминала: 100
// Высота терминала: 35
// Это вёрстка для широкого экрана | Сюда влезет много широкого контента
