import {currentTestRuntime} from "./TestRuntime";
import {TestLayout} from "../notcompose-terminal/TestLayout";

export function currentTestLayout(): TestLayout {
    return currentTestRuntime()['testLayout'] as TestLayout
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
