import type { TestInput } from './TestInput.js'
import { currentTestRuntime } from '@notcompose/testing-core'

export function currentTestInput(): TestInput {
    return currentTestRuntime()['testInput'] as TestInput
}

export function emulateInput(string: string, key: any) {
    currentTestInput().emulate(string, key)
}
