import {Composer} from "../../../src/notcompose/runtime/Composer";
import {currentComposerOrNull, setCurrentComposer} from "../../../src/notcompose/runtime/currentComposer";
import {RecomposeLambdaExtensionKey} from "../../../src/notcompose/runtime-plugins/partialRecomposition/RecomposeLambda";
import {Node} from "../../../src/notcompose/runtime/Node";
import {error} from "../../../src/core/exceptions";


export class TestRuntime implements Record<string, unknown> {
    constructor(
        public readonly rootNode: Node,
        public readonly composer: Composer,
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
        const previousComposer = currentComposerOrNull()
        setCurrentComposer(this.composer)

        try {
            this.composer.startRootNode(this.rootNode)
            this.composer.applyExtension(RecomposeLambdaExtensionKey, content)
            this.composer.startComposingNode()
            content()
            this.composer.endComposingNode()
            this.composer.endRootNode()
        } finally {
            setCurrentComposer(previousComposer)
        }
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
