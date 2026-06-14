import {describe, expect, it} from "vitest";
import {Key, mutableStateOf, remember, rememberState, strictEqualityPolicy} from "notcompose";
import {defaultTestRuntime} from "../helpers/runtimes/defaultTestRuntime.js";
import {flushRecompositions} from "../helpers/core/recompose.js";


describe("remember tests", () => {
    it("remember without keys works", () => {
        const runtime = defaultTestRuntime().use()
        const trigger = mutableStateOf<number>(0, strictEqualityPolicy())

        let calculations = 0
        const rememberedValues: string[] = []
        runtime.render(() => {
            const rememberedValue = remember(() => {
                calculations++
                return 'value'
            })
            rememberedValues.push(rememberedValue)
        })

        trigger.value++
        flushRecompositions()

        trigger.value++
        flushRecompositions()

        trigger.value++
        flushRecompositions()

        expect(calculations).toBe(1)
        expect(rememberedValues.every(it => it === 'value')).toBeTruthy()
    })

    it("remember with keys works", () => {
        const runtime = defaultTestRuntime().use()
        const keyState = mutableStateOf(0)

        let calculations = 0
        runtime.render(() => {
            remember([keyState.value], () => ++calculations)
        })

        keyState.value = 1
        flushRecompositions()

        keyState.value = 1
        flushRecompositions()

        keyState.value = 2
        flushRecompositions()

        expect(calculations).toBe(3)
    })

    it("rememberState without keys works", () => {
        const runtime = defaultTestRuntime().use()
        const trigger = mutableStateOf<number>(0, strictEqualityPolicy())

        let calculations = 0
        runtime.render(() => {
            trigger.value
            rememberState(() => ++calculations)
        })

        trigger.value = 1
        flushRecompositions()

        trigger.value = 2
        flushRecompositions()

        trigger.value = 2
        flushRecompositions()

        trigger.value = 3
        flushRecompositions()

        expect(calculations).toBe(1)
    })

    it("rememberState with keys works", () => {
        const runtime = defaultTestRuntime().use()
        const keyState = mutableStateOf(0)

        let calculations = 0
        runtime.render(() => {
            rememberState([keyState.value], () => ++calculations)
        })

        keyState.value = 1
        flushRecompositions()

        keyState.value = 2
        flushRecompositions()

        expect(calculations).toBe(3)
    })

    it("forget remembered values after unmount", () => {
        const runtime = defaultTestRuntime().use()
        const screen = mutableStateOf<"A" | "B">("A")

        let screenAValue: object | undefined
        let screenBValue: object | undefined
        let remountedScreenAValue: object | undefined

        runtime.render(() => {
            if (screen.value === "A") {
                Key("screen-a", () => {
                    const value = remember(() => ({screen: "A"}))
                    if (screenAValue === undefined) {
                        screenAValue = value
                    } else {
                        if (remountedScreenAValue !== undefined)
                            throw new Error('Unexpected')
                        remountedScreenAValue = value
                    }
                })
            } else {
                Key("screen-b", () => {
                    screenBValue = remember(() => ({screen: "B"}))
                })
            }
        })

        screen.value = "B"
        flushRecompositions()

        screen.value = "A"
        flushRecompositions()

        expect(screenBValue).toBeDefined()
        expect(remountedScreenAValue).toBeDefined()
        expect(remountedScreenAValue).not.toBe(screenAValue)
    })
})
