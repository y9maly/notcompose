import {subcompose, SubcomposeLayout} from "./notcompose-terminal/highlevel/SubcomposeLayout";
import {Modifier} from "./notcompose/runtime/Modifier";
import {Text} from "./notcompose-terminal/highlevel/Text";
import {BackgroundModifier} from "./notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {PaddingModifier} from "./notcompose-terminal/runtime/modifiers/PaddingModifier";
import {Alignment} from "./notcompose-terminal/runtime/ui/Alignment";
import {Column} from "./notcompose-terminal/highlevel/Column";


export function SubcomposeTestScreen() {
    Column(() => {
        Text('-----------')

        SubcomposeLayout((constraints) => {
            const one = subcompose(() => {
                Text('One')
            })[0].measure(constraints)

            const two = subcompose(() => {
                Text(`One size: ${one.width}x${one.height}`)
            })[0].measure(constraints.minusMaxHeight(one.height))

            const three = subcompose(() => {
                Text(`NOT PLACED (must be invisible)`)
            })[0].measure(constraints)

            // ограничение ширины для four будет шириной three
            // Так, `Long story text` обрежется до `Long story `
            let c = constraints
            const [four, five] = subcompose(() => {
                Text(`Small text_`)
                Text(`Long story text`)
            }).map(it => {
                const result = it.measure(c)
                c = c.copy({ maxWidth: result.width })
                return result
            })

            return {
                width: Math.max(one.width, two.width, three.width, four.width),
                height: 5,
                placeChildren() {
                    one.place(0, 0)
                    two.place(0, 1)
                    // three.place(0, 2)
                    four.place(0, 3)
                    five.place(0, 4)
                }
            }
        }, new Modifier([
            BackgroundModifier('.'),
            PaddingModifier(2, 1),
            // MaxSizeModifier(100, 1)
        ]))

        Text('-----------')
    }, undefined, {
        horizontalAlignment: Alignment.CenterHorizontally
    })
}
