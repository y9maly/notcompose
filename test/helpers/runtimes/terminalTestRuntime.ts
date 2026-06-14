import {TestRuntime} from "../core/TestRuntime.js";
import {bootstrapTerminalComposition, InputProcessor, RootInputDispatcher} from "notcompose/terminal";
import {TestInputSource} from "../notcompose-terminal/TestInputSource.js";
import {TestOutputProcessor} from "../notcompose-terminal/TestOutputProcessor.js";
import {TestLayout} from "../notcompose-terminal/TestLayout.js";

export function terminalTestRuntime(): TestRuntime {
    const testInput = new TestInputSource()
    const testOutput = new TestOutputProcessor()

    const bootstrap = bootstrapTerminalComposition()

    const inputProcessor = new InputProcessor(
        testInput,
        new RootInputDispatcher(() => bootstrap.composition.rootNode)
    )

    const start = bootstrap.start({
        inputProcessor: inputProcessor,
        outputProcessor: testOutput,
        fps: 'manual',
        redrawOnViewportResize: false,
    })

    const runtime = new TestRuntime(bootstrap.composition.rootNode, bootstrap.composer, bootstrap.composition)
    runtime['recomposer'] = bootstrap.recomposer
    runtime['testInput'] = testInput
    runtime['testOutput'] = testOutput
    runtime['testLayout'] = start as TestLayout
    return runtime
}
