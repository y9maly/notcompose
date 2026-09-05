import type { Node } from '../runtime/Node.js'
import type { CompositionPlugin } from './CompositionPlugin.js'
import { CompositionRunDefault } from './CompositionRun.js'
import { currentCompositionRunOrNull, setCurrentCompositionRunUnsafe, withCompositionRun } from './currentCompositionRun.js'

/**
 * Управляет первой и всеми последующими композициями
 */
export interface CompositionSession {
    compose<R>(node: Node, block: () => R, runOptions?: { debugInformation?: string }): R
    dispose(): void
}

export class CompositionSessionDefault implements CompositionSession {
    constructor(
        private readonly plugins: ReadonlyArray<CompositionPlugin> = [],
    ) {}

    private readonly runStack: CompositionRunDefault[] = []
    private currentRun: CompositionRunDefault | null = null

    get isInComposition(): boolean { return this.currentRun?.isInComposition === true }

    compose<R>(node: Node, block: () => R, runOptions?: { debugInformation?: string }): R {
        const run = new CompositionRunDefault(
            node,
            this,
            this.plugins,
            runOptions?.debugInformation
        )
        this.runStack.push(run)
        this.currentRun = run
        run.start()

        return withCompositionRun(run, (previousRun) => {
            let runResult: { completedExceptionally: false, result: R } | { completedExceptionally: true, exception: unknown }
            try {
                this.plugins.forEach(plugin => plugin.onEnterRun?.(previousRun, run))
                if (currentCompositionRunOrNull() !== run)
                    throw new Error(`Composition plugin cannot change current composition run inside 'onEnterRun'.`)

                const result = block()
                runResult = { completedExceptionally: false, result: result } as const
            } catch (e) {
                runResult = { completedExceptionally: true, exception: e } as const
            } finally {
                this.runStack.pop()
                this.currentRun = this.runStack.at(this.runStack.length - 1) ?? null
            }

            try {
                this.plugins.forEach(plugin => plugin.onExitRun?.(run, previousRun, runResult))
                if (currentCompositionRunOrNull() !== run)
                    throw new Error(`Composition plugin cannot change current composition run inside 'onExitRun'.`)
            } finally {
                run.finish()
            }

            if (runResult.completedExceptionally)
                throw runResult.exception
            return runResult.result
        })
    }

    dispose() {
        this.plugins.forEach(plugin => plugin.onDispose?.())
    }
}
