import { MutableState } from '../runtime/State.js'
import { remember } from '../recomputation/remember.js'
import { mutableStateOf } from './mutableStateOf.js'

export function rememberState<T>(
    valueOrCalculation: T | (() => T)
): MutableState<T> & Readonly<[T, (newValueOrUpdater: T | ((currentValue: T) => T)) => void, MutableState<T>]>

export function rememberState<T>(
    keys: unknown[],
    valueOrCalculation: T | (() => T)
): MutableState<T> & Readonly<[T, (newValueOrUpdater: T | ((currentValue: T) => T)) => void, MutableState<T>]>

export function rememberState<T>(
    a: T | unknown[] | (() => T),
    b?: T | (() => T),
): MutableState<T> & Readonly<[T, (newValueOrUpdater: T | ((currentValue: T) => T)) => void, MutableState<T>]> {
    let keys: unknown[]
    let calculation: () => T

    if (arguments.length === 2) {
        keys = a as unknown[]
        if (typeof b === 'function') {
            calculation = b as () => T
        } else {
            calculation = () => b! satisfies T
        }
    } else {
        keys = []
        if (typeof a === 'function') {
            calculation = a as () => T
        } else {
            calculation = () => a as T
        }
    }

    const state = remember(() => {
        const state = mutableStateOf<T | undefined>(undefined)
        return Object.assign(state,
            {
                * [Symbol.iterator]() {
                    yield state.value
                    yield (newValueOrUpdater: T | ((currentValue: T) => T)) => {
                        if (typeof newValueOrUpdater === 'function') {
                            const updater = newValueOrUpdater as (currentValue: T) => T
                            state.value = updater(state.value as T)
                        } else {
                            state.value = newValueOrUpdater
                        }
                    }
                    yield state
                }
            }
        ) as MutableState<T> & Readonly<[T, (newValueOrUpdater: T | ((currentValue: T) => T)) => void, MutableState<T>]>
    })
    remember(keys, () => state.value = calculation())

    return state
}
