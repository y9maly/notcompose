import { describe } from 'vitest'
import { draw, terminalTestRuntime } from '@notcompose/testing-terminal'
import { defaultTestRuntime } from '@notcompose/testing-core'
import { outsideComposition, remember } from '@notcompose/core'
import { runMolecule } from '@notcompose/molecule'


describe('Test nested composition', () => {
    it('test 1', () => {
        terminalTestRuntime().use()

        draw(() => {
            const nestedRuntime = defaultTestRuntime()

            nestedRuntime.render(() => {

            })
        })
    })

    it('nested composition inside leaved composition (runMolecule inside outsideComposition/remember should work)', () => {
        terminalTestRuntime().use()

        draw(() => {
            outsideComposition(() => {
                runMolecule(() => {})
            })

            remember(() => runMolecule(() => {}))
        })
    })
})
