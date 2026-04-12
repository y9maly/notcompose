import {rememberState} from "./notcompose/runtime-highlevel/rememberState";
import {DisposableEffect} from "./notcompose/runtime-highlevel/DisposableEffect";
import {Column} from "./notcompose-terminal/highlevel/Column";
import {Modifier} from "./notcompose/runtime/Modifier";
import {NameModifier} from "./notcompose/runtime/modifiers/NameElement";
import {Text} from "./notcompose-terminal/highlevel/Text";
import {Layout} from "./notcompose-terminal/runtime/layout/Layout";
import {MeasurePolicy, MeasureResult} from "./notcompose-terminal/runtime/layout/measure";
import {BackgroundModifier} from "./notcompose-terminal/runtime/modifiers/BackgroundModifier";

export function RecomposeTests() {}



let frameInRootCounter = 1
let frameInColumnCounter = 1
RecomposeTests.PartialRecomposeTest = () => {
    Column(() => {
        const state = rememberState(() => 0)

        DisposableEffect(() => {
            const interval = setInterval(() => state.value++, 1000)
            return () => clearInterval(interval)
        })

        // Text(new Modifier([NameModifier('Outer frame counter')]), `Outer column frame: ${frameInRootCounter++}`)
        state.value
        Text(`State read inside outer column: `, new Modifier([NameModifier('Outer state')]))
        // Text(new Modifier([NameModifier('Outer state')]), `State read inside outer column: ${state.value}`)

        Column(() => {
            Text(`Inner column frame: ${frameInColumnCounter++}`, new Modifier([NameModifier('Inner frame counter')]))
            Text(`State read inside inner column: ${state.value}`)
        }, new Modifier([NameModifier('Column 2')]))
    },
        new Modifier([NameModifier('Column 1')])
    )
}

RecomposeTests.RemeasureTest = () => {
    const state = rememberState(() => 0)

    DisposableEffect(() => {
        setInterval(() => state.value++, 1000)
    })

    Layout(() => {

    }, MeasurePolicy((measurables, constraints) => {
        if (state.value % 2 === 0) {
            return MeasureResult(2, 2)
        } else {
            return MeasureResult(4, 4)
        }
    }), new Modifier([
        BackgroundModifier('#')
    ]))
}













