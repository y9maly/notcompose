import { describe, it } from 'vitest'
import { Modifier, Text } from '@notcompose/terminal'
import { Box, MeasureResult, subcompose, SubcomposeLayout } from '@notcompose/layout'
import { assertVisuallyIdentical, draw, redraw, relayout, setViewport, terminalTestRuntime } from '@notcompose/testing-terminal'

describe('Draw', () => {
    function setup(width: number = 32, height: number = 8) {
        terminalTestRuntime().use()
        setViewport(width, height)
    }

    it('Offset works', () => {
        setup()

        draw(() => {
            Text('Hello', Modifier.offsetX(4))
        })

        assertVisuallyIdentical(`
    Hello
        `)
    })

    it('draw chain works correctly (BackgroundModifier + Offset)', () => {
        setup(12, 6)

        draw(() => {
            Box(() => {
                Text('Test')
            }, Modifier
                .offset(2, 1)
                .background('+')
                .padding(2, 1)
                .offsetX(4)
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
                .offset(1, 1)
                .border()
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
            Text('A', Modifier.drawContent(scope => {
                scope.drawContent()
                scope.translate(3, 0)
                scope.drawContent()
            }))
        })

        assertVisuallyIdentical(`
A  A
        `)
    })

    it('overlap works', () => {
        setup()

        draw(() => {
            Box(() => {
                Text('Hello world, hii!')
                Text('notcompose', Modifier.offsetX(6))
            }, Modifier.background('-'))
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
                    Text('x')
                })[0].measure(constraints)

                const b = subcompose(() => {
                    Text('###')
                })[0].measure(constraints)

                return MeasureResult(10, 1, () => {
                    a.place(0, 0, aZIndex)
                    b.place(0, 0, bZIndex)
                })
            }, Modifier.background('-'))
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
