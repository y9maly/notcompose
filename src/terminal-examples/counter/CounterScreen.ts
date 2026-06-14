import {DisposableEffect, Modifier, NameModifier, rememberState} from "notcompose";
import {Alignment, Box, Column, PaddingModifier} from "notcompose/layout";
import {BackgroundModifier, Text} from "notcompose/terminal";
import {ExampleHeader} from "../common/ExampleHeader.js";

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
