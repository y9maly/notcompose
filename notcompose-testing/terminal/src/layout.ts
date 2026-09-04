import type { TestLayout } from './TestLayout.js'
import { currentTestRuntime } from '@notcompose/testing-core'

export function currentTestLayout(): TestLayout {
    return currentTestRuntime().testLayout as TestLayout
}

export function relayout() {
    currentTestLayout().relayout()
}

export function redraw() {
    currentTestLayout().redraw()
}

export function draw(content: () => void) {
    currentTestRuntime().render(content)
    relayout()
    redraw()
}
