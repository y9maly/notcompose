import {MutableState, SnapshotMutationPolicy} from "../runtime/State.js";

export function mutableStateOf<T>(value: T, mutationPolicy?: SnapshotMutationPolicy<T>): MutableState<T> {
    return new MutableState<T>(value, mutationPolicy)
}
