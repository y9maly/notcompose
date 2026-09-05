import { describe, expect } from 'vitest'
import { defaultTestRuntime, flushRecompositions } from '@notcompose/testing-core'
import { DisposableEffect, LaunchedEffect, mutableStateOf, outsideComposition, remember, SideEffect } from '@notcompose/core'

describe('Leave composition tests', () => {
    it('outsideComposition works', () => {
        const runtime = defaultTestRuntime().use()
        const state = mutableStateOf(0)
        const outsideState = mutableStateOf(0)

        runtime.render(() => {
            state.value
            outsideComposition(() => {
                outsideState.value
            })
        })
        flushRecompositions()

        state.value++
        expect(flushRecompositions()).toBe(1)
        outsideState.value++
        expect(flushRecompositions()).toBe(0)
    })

    it('SideEffect must leave composition', () => {
        const runtime = defaultTestRuntime().use()
        const state = mutableStateOf(0)
        let stateRead = 0

        runtime.render(() => {
            SideEffect(() => {
                state.value
                stateRead++
            })
        })

        expect(stateRead).toBe(1)
        flushRecompositions()
        state.value = 1
        expect(flushRecompositions()).toBe(0)
    })

    it('LaunchedEffect must leave composition', () => {
        const runtime = defaultTestRuntime().use()
        const state = mutableStateOf(0)
        let stateRead = 0

        runtime.render(() => {
            LaunchedEffect(() => {
                state.value
                stateRead++
            })
        })

        expect(stateRead).toBe(1)
        flushRecompositions()
        state.value = 1
        expect(flushRecompositions()).toBe(0)
    })

    it('DisposableEffect must leave composition', () => {
        const runtime = defaultTestRuntime().use()
        const state = mutableStateOf(0)
        let stateRead = 0

        runtime.render(() => {
            DisposableEffect(() => {
                state.value
                stateRead = 1
                return () => {
                    state.value
                    stateRead = 2
                }
            })
        })

        expect(stateRead).toBe(1)
        flushRecompositions()
        state.value = 1
        expect(flushRecompositions()).toBe(0)

        runtime.render(() => {})
        expect(stateRead).toBe(2)
        state.value = 2
        expect(flushRecompositions()).toBe(0)
    })

    it('Remember must leave composition', () => {
        const runtime = defaultTestRuntime().use()
        const state = mutableStateOf(0)
        let stateRead = 0

        runtime.render(() => {
            remember(() => {
                state.value
                stateRead++
            })

            remember.keyed('key', () => {
                state.value
                stateRead++
            })
        })

        expect(stateRead).toBe(2)
        flushRecompositions()
        state.value = 1
        expect(flushRecompositions()).toBe(0)
    })
})
