import {Composer} from "../../../src/notcompose/runtime/Composer";
import {Node} from "../../../src/notcompose/runtime/Node";
import {error} from "../../../src/core/exceptions";
import {Composition} from "../../../src/notcompose-terminal/Composition";
import {Modifier} from "../../../src/notcompose/runtime/Modifier";
import {NameElement} from "../../../src/notcompose/runtime/modifiers/NameElement";

export class TestRuntime implements Record<string, unknown> {
    constructor(
        public readonly rootNode: Node,
        public readonly composer: Composer,
        public readonly composition: Composition
    ) {}

    [name: string]: unknown

    use(): TestRuntime {
        current = this
        return this
    }

    with<T>(block: () => T): T {
        return withTestRuntime(this, block)
    }

    render(content: () => void) {
        this.composition.setContent(content)
        this.composition.compose(new Modifier([new NameElement('Root')]))
    }
}

let current: TestRuntime | null = null
export const currentTestRuntime = () => current ?? error('No test runtime here')
export const currentTestRuntimeOrNull = () => current
export function withTestRuntime<T>(runtime: TestRuntime, block: () => T): T {
    const previous = current
    try {
        current = runtime
        return block()
    } finally {
        current = previous
    }
}
