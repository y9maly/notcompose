import { Composer, type CompositionSession, error, Modifier, NameModifier, Node } from '@notcompose/core'

interface CompositionRunnerLike {
    readonly rootNode: Node

    setContent(content: () => void): void
    invalidate(): void
    invokeWhenInvalidated(callback: () => void): void
    compose(modifier: Modifier): void
}

export class TestRuntime implements Record<string, unknown> {
    constructor(
        public readonly rootNode: Node,
        public readonly composer: Composer,
        public readonly compositionSession: CompositionSession,
        public readonly compositionRunner: CompositionRunnerLike,
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
        this.compositionRunner.setContent(content)
        this.compositionRunner.compose(Modifier.then(NameModifier('Root')))
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
