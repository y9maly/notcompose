import { Composer, error, Modifier, NameModifier, Node, type RecomposeLambda, RecomposeLambdaExtensionKey, withComposer } from '@notcompose/core'
import { TestComposition } from './TestComposition.js'

interface CompositionLike {
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
        public readonly composition: CompositionLike,
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
        this.composition.compose(Modifier.then(NameModifier('Root')))
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
