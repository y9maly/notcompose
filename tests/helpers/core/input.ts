import {currentTestRuntime} from "./TestRuntime";
import {TestInput} from "../notcompose-terminal/TestInput";

export function currentTestInput(): TestInput {
    return currentTestRuntime()['testInput'] as TestInput
}

export function emulateInput(string: string, key: any) {
    currentTestInput().emulate(string, key)
}
