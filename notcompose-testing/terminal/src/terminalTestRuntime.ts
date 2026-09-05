import { TestRuntime } from '@notcompose/testing-core'
import { TestInputSource } from './TestInputSource.js'
import { TestOutputProcessor } from './TestOutputProcessor.js'
import { bootstrapTerminalComposition, InputProcessor, RootInputDispatcher } from '@notcompose/terminal'
import { BoxMeasurePolicy, MeasurePolicyExtensionKey } from '@notcompose/layout'

export function terminalTestRuntime(): TestRuntime {
    const testInput = new TestInputSource()
    const testOutput = new TestOutputProcessor()

    const bootstrap = bootstrapTerminalComposition()

    const inputProcessor = new InputProcessor(
        testInput,
        new RootInputDispatcher(() => bootstrap.compositionRunner.rootNode)
    )

    const start = bootstrap.start({
        inputProcessor: inputProcessor,
        outputProcessor: testOutput,
        fps: 'manual',
        redrawOnViewportResize: false,
    })

    const runtime = new TestRuntime(bootstrap.compositionRunner.rootNode, bootstrap.composer, bootstrap.compositionSession, bootstrap.compositionRunner)

    runtime.compositionRunner.rootNode.extensions.set(MeasurePolicyExtensionKey.symbol, BoxMeasurePolicy)
    runtime.recomposer = bootstrap.recomposer
    runtime.testInput = testInput
    runtime.testOutput = testOutput
    runtime.testLayout = start
    return runtime
}
