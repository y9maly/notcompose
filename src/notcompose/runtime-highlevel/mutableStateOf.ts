import {MutableState} from "../runtime/State.js";


export function mutableStateOf<T>(value: T): MutableState<T> {
    return new MutableState<T>(value)
}
