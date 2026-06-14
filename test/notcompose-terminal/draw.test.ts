import {describe, it} from "vitest";
import {terminalTestRuntime} from "../helpers/runtimes/terminalTestRuntime.js";
import {BackgroundModifier, BorderModifier, DrawModifier, Text} from "notcompose/terminal";
import {assertVisuallyIdentical, setViewport} from "../helpers/core/output.js";
import {Modifier} from "notcompose";
import {
    Box,
    MeasureResult,
    OffsetModifier,
    OffsetXModifier,
    PaddingModifier,
    subcompose,
    SubcomposeLayout
} from "notcompose/layout";
import {draw, redraw, relayout} from "../helpers/core/layout.js";


describe("Draw", () => {
    function setup(width: number = 32, height: number = 8) {
        terminalTestRuntime().use()
        setViewport(width, height)
    }

    it('Offset works', () => {
        setup()

        draw(() => {
            Text('Hello', new Modifier([OffsetXModifier(4)]))
        })

        assertVisuallyIdentical(`
    Hello
        `)
    })

    it('draw chain works correctly (BackgroundModifier + Offset)', () => {
        setup(12, 6)

        draw(() => {
            Box(() => {
                Text("Test")
            }, new Modifier([
                OffsetModifier(2, 1),
                BackgroundModifier('+'),
                PaddingModifier(2, 1),
                OffsetXModifier(4)
            ]))
        })

        assertVisuallyIdentical(`

  ++++++++
  ++++++Test
  ++++++++
        `)
    })

    it('BorderModifier', () => {
        setup(12, 6)

        draw(() => {
            Box(() => {
                Text('Hello')
            }, new Modifier([
                OffsetModifier(1, 1),
                BorderModifier(),
            ]))
        })

        assertVisuallyIdentical(`

 ┌─────┐
 │Hello│
 └─────┘
        `)
    })

    it('drawContent works multiply times', () => {
        setup(12, 6)

        draw(() => {
            Text('A', new Modifier([
                DrawModifier(scope => {
                    scope.drawContent()
                    scope.translate(3, 0)
                    scope.drawContent()
                }),
            ]))
        })

        assertVisuallyIdentical(`
A  A
        `)
    })

    it('overlap works', () => {
        setup()

        draw(() => {
            Box(() => {
                Text("Hello world, hii!")
                Text("notcompose", new Modifier([OffsetXModifier(6)]))
            }, new Modifier([
                BackgroundModifier('-')
            ]))
        })

        assertVisuallyIdentical(`
Hello notcompose!
        `)
    })

    it('z index works', () => {
        setup()

        let aZIndex = 1
        let bZIndex = 2

        draw(() => {
            SubcomposeLayout((constraints) => {
                const a = subcompose(() => {
                    Text("x")
                })[0].measure(constraints)

                const b = subcompose(() => {
                    Text("###")
                })[0].measure(constraints)

                return MeasureResult(10, 1, () => {
                    a.place(0, 0, aZIndex)
                    b.place(0, 0, bZIndex)
                })
            }, new Modifier([
                BackgroundModifier('-')
            ]))
        })

        assertVisuallyIdentical(`
###-------
        `)

        aZIndex = 2
        bZIndex = 1

        relayout()
        redraw()

        assertVisuallyIdentical(`
x##-------
        `)
    })
})
