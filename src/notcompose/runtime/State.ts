import {GlobalSnapshot} from "./Snapshot.js";

export interface State<out T> {
    readonly value: T
    // todo (): T
}

export interface MutationPolicy<T> {
    (a: T, b: T): boolean
}

// eslint-disable-next-line eqeqeq
function LooseEqualityPolicy<T>(a: T, b: T) { return a == b }
function StrictEqualityPolicy<T>(a: T, b: T) { return Object.is(a, b) }
function NeverEqualPolicy() { return false }

export function looseEqualityPolicy<T>(): MutationPolicy<T> { return LooseEqualityPolicy }
export function strictEqualityPolicy<T>(): MutationPolicy<T> { return StrictEqualityPolicy }
export function neverEqualPolicy<T>(): MutationPolicy<T> { return NeverEqualPolicy }

export interface MutableState<T> extends State<T> {
    value: T
}

class MutableStateImpl<T> implements MutableState<T> {
    constructor(
        private _value: T,
        private mutationPolicy: MutationPolicy<T> = strictEqualityPolicy()
    ) {}

    get value() {
        GlobalSnapshot.observeRead(this)
        return this._value
    }

    set value(value: T) {
        if (this.mutationPolicy(this._value, value))
            return
        this._value = value
        GlobalSnapshot.observeWrite(this)
    }
}

export interface MutableStateConstructor {
    new <T>(value: T, mutationPolicy?: MutationPolicy<T>): MutableState<T>
}

export const MutableState: MutableStateConstructor = MutableStateImpl
