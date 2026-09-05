import type { State } from '../runtime/State.js'
import { remember } from '../recomputation/remember.js'
import { mutableStateOf } from './mutableStateOf.js'

export function rememberUpdatedState<T>(value: T): State<T> {
    const state = remember(() => mutableStateOf<T | undefined>(undefined))
    state.value = value
    return state as State<T>
}
