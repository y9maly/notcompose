import {AnnotatedString} from "notcompose/terminal";
import {TestOutput} from "../notcompose-terminal/TestOutput.js";
import {currentTestRuntime} from "./TestRuntime.js";

export function currentTestOutput(): TestOutput {
    return currentTestRuntime().testOutput as TestOutput
}

export function setViewport(width: number, height: number) {
    const output = currentTestOutput()
    output.viewportWidth = width
    output.viewportHeight = height
}

export function assertVisuallyIdentical(expectedFrame: string) {
    const diff = compareOutput(expectedFrame)
    if (diff.isEqual)
        return

    throw new Error(
        [
            "Expected output:",
            renderFramedRows(diff.expectedRows, diff.frameWidth),
            "Actual output:",
            renderFramedRows(diff.actualRows, diff.frameWidth),
        ].join("\n"),
    )
}

export function isVisuallyIdentical(expectedFrame: string) {
    return compareOutput(expectedFrame).isEqual
}

type OutputComparison = {
    isEqual: boolean
    expectedRows: string[]
    actualRows: string[]
    frameWidth: number
}

function compareOutput(expectedFrame: string): OutputComparison {
    const output = currentTestOutput()
    const expectedRows = normalizeExpectedRows(expectedFrame)
    const actualRows = normalizeActualRows(output.lastOutput)

    const normalizedExpected = trimTrailingBlankRows(expectedRows)
    const normalizedActual = trimTrailingBlankRows(actualRows)

    const maxRows = Math.max(normalizedExpected.length, normalizedActual.length)
    const isEqual = Array.from({length: maxRows}, (_, index) => {
        return (normalizedExpected[index] ?? "") === (normalizedActual[index] ?? "")
    }).every(Boolean)

    return {
        isEqual,
        expectedRows: normalizedExpected,
        actualRows: normalizedActual,
        frameWidth: Math.max(
            output.lastOutputWidth,
            ...normalizedExpected.map(it => it.length),
            ...normalizedActual.map(it => it.length),
            0,
        ),
    }
}

function normalizeExpectedRows(frame: string): string[] {
    const lines = frame.replace(/\r\n/g, "\n").split("\n")

    if (lines.length > 0 && lines[0].trim() === "") {
        lines.shift()
    }

    if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop()
    }

    return lines.map(line => line.trimEnd())
}

function normalizeActualRows(rows: AnnotatedString[] | undefined): string[] {
    if (rows === undefined) {
        return []
    }

    return rows.map(row => row.string.trimEnd())
}

function trimTrailingBlankRows(rows: string[]): string[] {
    const result = [...rows]

    while (result.length > 0 && result[result.length - 1].trim() === "") {
        result.pop()
    }

    return result
}

function renderFramedRows(rows: string[], width: number): string {
    const top = `┌${"─".repeat(width + 2)}┐`
    const bottom = `└${"─".repeat(width + 2)}┘`

    const body = rows.map(row => `│ ${row.padEnd(width, " ")} │`)

    return [top, ...body, bottom].join("\n")
}
