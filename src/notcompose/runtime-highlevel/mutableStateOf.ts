import { MutableState, MutationPolicy } from '../runtime/State.js'

export function mutableStateOf<T>(value: T, mutationPolicy?: MutationPolicy<T>): MutableState<T> {
    return new MutableState<T>(value, mutationPolicy)
}
