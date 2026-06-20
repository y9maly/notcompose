import {describe, it} from "vitest";
import {terminalTestRuntime} from "../helpers/runtimes/terminalTestRuntime.js";
import {background, border, DrawModifier, Text} from "notcompose/terminal";
import {assertVisuallyIdentical, setViewport} from "../helpers/core/output.js";
import {Modifier} from "notcompose";
import {
    Box,
    MeasureResult,
    offset,
    offsetX,
    padding,
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
            Text('Hello', Modifier.then(offsetX(4)))
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
            }, Modifier
                .then(offset(2, 1))
                .then(background('+'))
                .then(padding(2, 1))
                .then(offsetX(4))
            )
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
            }, Modifier
                .then(offset(1, 1))
                .then(border())
            )
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
            Text('A', Modifier.then(DrawModifier(scope => {
                scope.drawContent()
                scope.translate(3, 0)
                scope.drawContent()
            })))
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
                Text("notcompose", Modifier.then(offsetX(6)))
            }, Modifier.then(background('-')))
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
            }, Modifier.then(background('-')))
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
