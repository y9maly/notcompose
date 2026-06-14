import {currentTestRuntime} from "./TestRuntime.js";
import {TestInput} from "../notcompose-terminal/TestInput.js";

export function currentTestInput(): TestInput {
    return currentTestRuntime()['testInput'] as TestInput
}

export function emulateInput(string: string, key: any) {
    currentTestInput().emulate(string, key)
}
