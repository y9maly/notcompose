import {Modifier} from "../../notcompose/runtime/Modifier";
import {Box} from "../../notcompose-terminal/highlevel/Box";
import {PaddingModifier} from "../../notcompose-terminal/runtime/modifiers/PaddingModifier";
import {BackgroundModifier} from "../../notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {NameModifier} from "../../notcompose/runtime/modifiers/NameElement";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Alignment} from "../../notcompose-terminal/runtime/ui/Alignment";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {DisposableEffect} from "../../notcompose/runtime-highlevel/DisposableEffect";
import {ExampleHeader} from "../common/ExampleHeader";


export function CounterScreen(modifier: Modifier = new Modifier()) {
    // THIS will be invoked only once



    // State that initializes with zero
    const counter = rememberState(() => 0)

    DisposableEffect(() => {
        // Increment counter every second
        const interval = setInterval(() => counter.value++, 1000)

        // Invoked when [CounterScreen] exited from composition
        return () => clearInterval(interval)
    })



    Column(() => {
        // THIS will be invoked only once

        ExampleHeader(` CounterScreen example `)

        Box(() => {
            // THIS will be re-invoked every second because we are reading state [counter] here

            Text(`counter: ${counter.value}`)
        }, new Modifier([
            NameModifier('Box'), // for debug
            BackgroundModifier('.'),
            PaddingModifier({ vertical: 2, horizontal: 4 })
        ]))
    }, modifier, {
        horizontalAlignment: Alignment.CenterHorizontally
    })
}
