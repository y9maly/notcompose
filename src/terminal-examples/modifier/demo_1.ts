import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Box} from "../../notcompose-terminal/highlevel/Box";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {PaddingModifier} from "../../notcompose-terminal/runtime/modifiers/PaddingModifier";
import {BackgroundModifier} from "../../notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {SizeModifier} from "../../notcompose-terminal/runtime/modifiers/SizeModifier";


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
