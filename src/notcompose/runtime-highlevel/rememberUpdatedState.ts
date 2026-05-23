import {State} from "../runtime/State";
import {remember} from "./remember";
import {mutableStateOf} from "./mutableStateOf";

export function rememberUpdatedState<T>(value: T): State<T> {
    const state = remember(() => mutableStateOf<T | undefined>(undefined))
    state.value = value
    return state as State<T>
}
