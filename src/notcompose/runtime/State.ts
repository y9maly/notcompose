import {GlobalSnapshot} from "./Snapshot";

export abstract class State<out T> {
    abstract get value(): T
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

export class MutableState<T> extends State<T> {
    constructor(
        private _value: T,
        private mutationPolicy: SnapshotMutationPolicy<T> = strictEqualityPolicy()
    ) { super() }

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
