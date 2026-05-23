import {GlobalSnapshot} from "./Snapshot";

export interface State<out T> {
    get value(): T
}

export interface SnapshotMutationPolicy<T> {
    (a: T, b: T): boolean
}

function LooseEqualityPolicy<T>(a: T, b: T) { return a == b }
function StrictEqualityPolicy<T>(a: T, b: T) { return Object.is(a, b) }
function NeverEqualPolicy() { return false }

export function looseEqualityPolicy<T>(): SnapshotMutationPolicy<T> { return LooseEqualityPolicy }
export function strictEqualityPolicy<T>(): SnapshotMutationPolicy<T> { return StrictEqualityPolicy }
export function neverEqualPolicy<T>(): SnapshotMutationPolicy<T> { return NeverEqualPolicy }

export interface MutableState<T> extends State<T> {
    set value(value: T)
}

class MutableStateImpl<T> implements MutableState<T> {
    constructor(
        private _value: T,
        private mutationPolicy: SnapshotMutationPolicy<T> = strictEqualityPolicy()
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
    new <T>(value: T, mutationPolicy?: SnapshotMutationPolicy<T>): MutableState<T>
}

export const MutableState: MutableStateConstructor = MutableStateImpl
