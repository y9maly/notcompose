import {BackgroundModifier, setTerminalContent, Text} from "notcompose/terminal";
import {FillMaxSizeModifier, Layout, MeasurePolicy, MeasureResult} from "notcompose/layout";
import {Modifier} from "notcompose";

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
