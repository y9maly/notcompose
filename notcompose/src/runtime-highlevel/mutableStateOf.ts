import { type EqualityPolicy, MutableState } from '../runtime/State.js'

export function mutableStateOf<T>(value: T, equalityPolicy?: EqualityPolicy<T>): MutableState<T> {
    return new MutableState<T>(value, equalityPolicy)
}
