import {BackgroundModifier, setTerminalContent, Text} from "notcompose/terminal";
import {Box, Column, PaddingModifier, SizeModifier} from "notcompose/layout";
import {Modifier} from "notcompose";

setTerminalContent(() => {
    Column(() => {
        Box(() => {
            Text('Hello')
        }, new Modifier([
            BackgroundModifier('_'),
            PaddingModifier({ horizontal: 2, vertical: 2 }),
        ]))

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, new Modifier([
            PaddingModifier({ horizontal: 2, vertical: 2 }),
            BackgroundModifier('_'),
        ]))

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, new Modifier([
            BackgroundModifier('_'),
            PaddingModifier({ horizontal: 2, vertical: 2 }),
            SizeModifier(7),
        ]))

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, new Modifier([
            SizeModifier(7),
            BackgroundModifier('_'),
            PaddingModifier({ horizontal: 2, vertical: 2 }),
        ]))
    })
})


// Output:
// _________
// _________
// __Hello__
// _________
// _________
// -----------------------------------------
//
//
//   Hello
//
//
// -----------------------------------------
// ___________
// ___________
// __Hello____
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// -----------------------------------------
// _______
// _______
// __Hel__
// _______
// _______
// _______
// _______
