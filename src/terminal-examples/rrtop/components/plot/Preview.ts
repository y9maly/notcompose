import {setTerminalContent} from "../../../../notcompose-terminal/setTerminalContent";
import {SolidPlot} from "./SolidPlot";
import {Modifier} from "../../../../notcompose/runtime/Modifier";
import {SizeModifier} from "../../../../notcompose-layout/runtime/modifiers/SizeModifier";
import {BorderedTitledBox} from "../BorderedTitledBox";
import {Column} from "../../../../notcompose-layout/highlevel/Column";
import {Text} from "../../../../notcompose-terminal/highlevel/Text";

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
                    new Modifier([
                        SizeModifier(35, 10)
                    ])
                )
            }
        )
    })

})
