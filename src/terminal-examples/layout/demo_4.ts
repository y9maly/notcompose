import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Layout} from "../../notcompose-terminal/runtime/layout/Layout";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {FillMaxSizeModifier} from "../../notcompose-terminal/runtime/modifiers/FillModifier";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {MeasurePolicy} from "../../notcompose-terminal/runtime/layout/MeasurePolicy";
import {MeasureResult} from "../../notcompose-terminal/runtime/layout/Measurable";
import {BackgroundModifier} from "../../notcompose-terminal/runtime/modifiers/BackgroundModifier";


setTerminalContent(() => {
    Layout(() => {
        Text('Hello', new Modifier([
            BackgroundModifier('-'),
            FillMaxSizeModifier()
        ]))

        Text('World')
    }, MeasurePolicy((measurables, constraints) => {
        const hello = measurables[0]
        const world = measurables[1]

        const h = world.minIntrinsicHeight(constraints.maxWidth)

        const helloPlaceable = hello.measure(constraints.minusMaxHeight(h))
        const worldPlaceable = world.measure(constraints.minusMaxHeight(helloPlaceable.height))

        return MeasureResult(
            Math.max(helloPlaceable.width, worldPlaceable.width),
            helloPlaceable.height + worldPlaceable.height,
            () => {
                helloPlaceable.place(0, 0)
                worldPlaceable.place(0, helloPlaceable.height)
            }
        )
    }))
})
