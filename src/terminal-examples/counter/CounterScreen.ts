import { DisposableEffect, Modifier, NameModifier, rememberState } from 'notcompose'
import { Alignment, Box, Column, padding } from 'notcompose/layout'
import { background, Text } from 'notcompose/terminal'
import { ExampleHeader } from '../common/ExampleHeader.js'

export function CounterScreen(modifier: Modifier = Modifier) {
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
        }, Modifier
            .then(NameModifier('Box')) // debug information
            .then(background('.'))
            .then(padding({ vertical: 2, horizontal: 4 }))
        )
    }, modifier, {
        horizontalAlignment: Alignment.CenterHorizontally
    })
}
