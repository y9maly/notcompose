import { Modifier, setTerminalContent, Text } from 'notcompose/terminal'
import { SolidPlot } from './SolidPlot.js'
import { Column, size } from 'notcompose/layout'
import { BorderedTitledBox } from '../BorderedTitledBox.js'

setTerminalContent(() => {

    Column(() => {
        BorderedTitledBox(
            () => Text('Title'),
            () => {
                SolidPlot(
                    {
                        items: [
                            { value: 0 },
                            { value: 1 },
                            { value: 4 },
                            { value: 2 },
                            { value: 5 },
                            { value: 5 },
                            { value: 6 },
                            { value: 2 },
                            { value: 0 },
                        ],
                    },
                    Modifier.size(35, 10),
                )
            }
        )
    })

})
