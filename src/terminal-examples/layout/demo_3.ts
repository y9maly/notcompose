import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {input} from "../../notcompose-terminal/runtime/Input";
import {subcompose, SubcomposeLayout} from "../../notcompose-terminal/highlevel/SubcomposeLayout";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Row} from "../../notcompose-terminal/highlevel/Row";
import {MeasureResult} from "../../notcompose-terminal/runtime/layout/measure";
import {Key} from "../../notcompose/runtime-highlevel/Key";
import {Box} from "../../notcompose-terminal/highlevel/Box";


setTerminalContent(() => {
    const textField = rememberState(() => '')

    input((str, key) => {
        if (key && key.name === 'backspace' || key.name === 'delete') {
            textField.value = textField.value.slice(0, -1)
        } else {
            textField.value += str
        }
        return true
    })

    SubcomposeLayout((constraints) => {
        const placeable1 = subcompose(() => {
            Text(`> ${textField.value}`)
        })[0].measure(constraints)

        const placeable2 = subcompose(() => {
            if (placeable1.width > 30) {
                Key(1, () => {
                    Row(() => {
                        Text('Ты ввёл много текста')
                        Text(' | ')
                        Text('Даже слишком много...')
                    })
                })
            } else {
                Key(2, () => {
                    Text('Ты ввёл мало текста')
                })
            }
        })[0].measure(constraints)

        const width = placeable1.width
        const height = 3
        return MeasureResult(width, height, () => {
            placeable1.place(0, 0)
            placeable2.place(0, 2)
        })
    })
})

// Output when textField.value.length <= 30:
// > qwerty
//
// Ты ввёл мало текста

// Output while textField.value.length > 30:
// > qwertyuiopqwertyuiopqwertyuiop
//
// Ты ввёл много текста | Даже слишком много...
