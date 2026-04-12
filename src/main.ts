import {rememberState} from "./notcompose/runtime-highlevel/rememberState";
import {Column} from "./notcompose-terminal/highlevel/Column";
import {Modifier} from "./notcompose/runtime/Modifier";
import {Text} from "./notcompose-terminal/highlevel/Text";
import {remember} from "./notcompose/runtime-highlevel/remember";
import {PaddingModifier} from "./notcompose-terminal/runtime/modifiers/PaddingModifier";
import {BackgroundModifier} from "./notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {LaunchedEffect} from "./notcompose/runtime-highlevel/LaunchedEffect";
import process from "node:process";
import {setTerminalContent} from "./notcompose-terminal/setTerminalContent";

process.stdin.on('keypress', (_, key) => { if (key.name === 'c' && key.ctrl) process.exit() });

function Content1() {
    Column(remember(() => () => {
        const state = rememberState(() => 0)

        LaunchedEffect(() => {
            setInterval(() => { state.value++ }, 500)
        })

        Text(`Хай ${state.value}`)

        Text(`12${state.value}`)
    }), new Modifier([
        // BackgroundModifier('x'),
        PaddingModifier(1),
        BackgroundModifier('-'),
        PaddingModifier(2, 1),
        // FixedSizeModifier(15, 2)
    ]))
}

function Content2() {
    const counter = rememberState(() => 0)

    LaunchedEffect(() => {
        setInterval(() => counter.value++, 1000)
    })

    const date = rememberState([counter.value], () => Date.now())

    Text(`Date: ${date.value}`)
}

setTerminalContent(() => {
    // Box(new Modifier(), () => {
    // DemoScreen()
    // FilesScreen()
    // Content1()
    // Content2()
    // SubcomposeTestScreen()
    // RecomposeTests.RemeasureTest()
    // })
})
