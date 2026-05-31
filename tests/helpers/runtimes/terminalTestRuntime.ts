import {TestRuntime} from "../core/TestRuntime";
import {defaultTestRuntime} from "./defaultTestRuntime";
import {bootstrapTerminalComposition} from "../../../src/notcompose-terminal/bootstrapTerminalComposition";
import {InputProcessor} from "../../../src/notcompose-terminal/runtime-input/InputProcessor";
import {RootInputDispatcher} from "../../../src/notcompose-terminal/runtime-input/InputDispatcher";
import {TestInputSource} from "../notcompose-terminal/TestInputSource";
import {TestOutputProcessor} from "../notcompose-terminal/TestOutputProcessor";
import {TestLayout} from "../notcompose-terminal/TestLayout";

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
