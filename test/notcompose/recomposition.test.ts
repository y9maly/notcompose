import { describe, expect, it } from 'vitest'
import { Key, mutableStateOf, remember, rememberState, strictEqualityPolicy } from 'notcompose'
import { defaultTestRuntime } from '../helpers/runtimes/defaultTestRuntime.js'
import { flushRecompositions } from '../helpers/core/recompose.js'

describe('recomposition tests', () => {
    it('no extra recompositions', () => {
        const runtime = defaultTestRuntime().use()
        const keyState = mutableStateOf(0)

        let calculations = 0
        const calculationValues: number[] = []
        runtime.render(() => {
            const calculationValue = remember([keyState.value], () => ++calculations)
            calculationValues.push(calculationValue)
        })

        flushRecompositions()

        keyState.value = 1
        flushRecompositions()

        keyState.value = 1
        flushRecompositions()

        keyState.value = 2
        flushRecompositions()

        expect(calculationValues).toEqual([1, 2, 3])
        expect(calculations).toBe(3)
    })

    it('no extra recompositions when setting equal value to the state', () => {
        const runtime = defaultTestRuntime().use()
        const trigger = mutableStateOf<number>(0, strictEqualityPolicy())

        const triggerValues: number[] = []
        runtime.render(() => {
            triggerValues.push(trigger.value)
        })

        // no recompositions until state changed
        expect(flushRecompositions()).toBe(0)

        // one recomposition after state change
        trigger.value = 1
        expect(flushRecompositions()).toBe(1)

        // no recomposition after no state change (from 1 to 1 => no state change when strictEqualityPolicy)
        trigger.value = 1
        expect(flushRecompositions()).toBe(0)

        // one recomposition after state change
        trigger.value = 0
        expect(flushRecompositions()).toBe(1)

        expect(triggerValues).toEqual([0, 1, 0])
    })

    // ---------------------------------------------------------------------------------------------------------------
    // Если мы пишет стейт, и только после этого читаем - рекомпозировать НЕ нужно. Прочитано уже актуальное значение.
    // ---------------------------------------------------------------------------------------------------------------

    it('no extra recompositions when write before read (manual)', () => {
        const runtime = defaultTestRuntime().use()
        const keyState = mutableStateOf(0)

        let calculations = 0
        const calculationValues: number[] = []
        runtime.render(() => {
            const calculationValue = remember(() => mutableStateOf(-1))
            remember([keyState.value], () => { calculationValue.value = ++calculations })
            calculationValues.push(calculationValue.value)
        })

        flushRecompositions()

        keyState.value = 1
        flushRecompositions()

        keyState.value = 2
        flushRecompositions()

        expect(calculations).toBe(3)
        expect(calculationValues).toEqual([1, 2, 3])
    })

    it('no extra recompositions when write before read (using rememberState)', () => {
        const runtime = defaultTestRuntime().use()
        const keyState = mutableStateOf(0)

        let calculations = 0
        const calculationValues: number[] = []
        runtime.render(() => {
            const calculationValue = rememberState([keyState.value], () => ++calculations)
            calculationValues.push(calculationValue.value)
        })

        flushRecompositions()

        keyState.value = 1
        flushRecompositions()

        keyState.value = 2
        flushRecompositions()

        expect(calculations).toBe(3)
        expect(calculationValues).toEqual([1, 2, 3])
    })

    // ------------------------------------------------------------------------------------------------
    // Если мы читаем стейт, а после этого он изменяется - состояние изменилось, нужно рекомпозировать.
    // ------------------------------------------------------------------------------------------------

    it('has recomposition when write after read', () => {
        const runtime = defaultTestRuntime().use()
        const keyState = mutableStateOf(0)

        let calculations = 0
        const calculationValues: number[] = []
        runtime.render(() => {
            const calculationValue = remember(() => mutableStateOf(-1))
            calculationValue.value
            remember([keyState.value], () => { calculationValue.value = ++calculations })
            calculationValues.push(calculationValue.value)
        })

        expect(flushRecompositions()).toBe(1)

        keyState.value = 1
        expect(flushRecompositions()).toBe(2)

        keyState.value = 2
        expect(flushRecompositions()).toBe(2)

        expect(calculations).toBe(3)
        expect(calculationValues).toEqual([1, 1, 2, 2, 3, 3])
    })

    // ---

    it('recomposes only the dirty subtree', () => {
        const runtime = defaultTestRuntime().use()
        const counter = mutableStateOf(0)

        let rootFrames = 0
        let staticFrames = 0
        let dynamicFrames = 0
        const seenValues: number[] = []

        runtime.render(() => {
            rootFrames++

            Key('static', () => {
                staticFrames++
            })

            Key('dynamic', () => {
                dynamicFrames++
                seenValues.push(counter.value)
            })
        })

        counter.value = 1
        flushRecompositions()

        expect(rootFrames).toBe(1)
        expect(staticFrames).toBe(1)
        expect(dynamicFrames).toBe(2)
        expect(seenValues).toEqual([0, 1])
    })

    it('recomposes consumers of the state that was actually written', () => {
        const runtime = defaultTestRuntime().use()
        const first = mutableStateOf(0)
        const second = mutableStateOf(0)

        let firstFrames = 0
        let secondFrames = 0

        runtime.render(() => {
            Key('first', () => {
                firstFrames++
                first.value
            })

            Key('second', () => {
                secondFrames++
                second.value
            })
        })

        second.value++
        flushRecompositions()

        expect(firstFrames).toBe(1)
        expect(secondFrames).toBe(2)
    })
})
