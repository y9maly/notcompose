import {MutableState} from "../runtime/State.js";
import {remember} from "./remember.js";
import {mutableStateOf} from "./mutableStateOf.js";

const Empty = Symbol()

export function rememberState<T>(
    calculation: () => T
): MutableState<T> & Readonly<[T, (value: T) => void]>

export function rememberState<T>(
    keys: unknown[],
    calculation: () => T
): MutableState<T> & Readonly<[T, (value: T) => void]>

export function rememberState<T>(
    a: unknown[] | (() => T),
    b: (() => T) | typeof Empty = Empty,
): MutableState<T> & Readonly<[T, (value: T) => void]> {
    let keys: unknown[]
    let calculation: () => T

    if (b === Empty) {
        keys = []
        calculation = a as () => T
    } else {
        keys = a as unknown[]
        calculation = b as () => T
    }

    const state = remember(() => mutableStateOf<T | typeof Empty>(Empty))
    remember(keys, () => state.value = calculation())

    return {
        get value() { return state.value as T },
        set value(value: T) { state.value = value },
        *[Symbol.iterator]() {
            yield state.value
            yield (value: T) => state.value = value
        }
    } as MutableState<T> & Readonly<[T, (value: T) => void]>
}
