import {describe, expect, it} from "vitest";
import {defaultTestRuntime} from "../helpers/runtimes/defaultTestRuntime.js";
import {DisposableEffect, Key, LaunchedEffect, mutableStateOf} from "notcompose";
import {flushRecompositions} from "../helpers/core/recompose.js";

describe("effects tests", () => {
    it('LaunchedEffect works correctly ', () => {
        const runtime = defaultTestRuntime().use()
        const launchKey = mutableStateOf(0)
        const unrelated = mutableStateOf(0)

        const launches: number[] = []

        runtime.render(() => {
            unrelated.value
            LaunchedEffect([launchKey.value], () => {
                launches.push(launchKey.value)
            })
        })

        unrelated.value = 1
        flushRecompositions()

        launchKey.value = 2
        flushRecompositions()

        expect(launches).toEqual([0, 2])
    })

    it("DisposableEffect works correctly", () => {
        const runtime = defaultTestRuntime().use()
        const effectKey = mutableStateOf(0)
        const enabled = mutableStateOf(true)

        const events: string[] = []

        runtime.render(() => {
            if (!enabled.value)
                return

            Key("effect-branch", () => {
                const currentKey = effectKey.value

                DisposableEffect([currentKey], () => {
                    events.push(`start:${currentKey}`)
                    return () => {
                        events.push(`dispose:${currentKey}`)
                    }
                })
            })
        })

        effectKey.value = 1
        flushRecompositions()

        enabled.value = false
        flushRecompositions()

        expect(events).toEqual([
            "start:0",
            "dispose:0",
            "start:1",
            "dispose:1",
        ])
    })
})
