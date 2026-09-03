import { GlobalSnapshot } from './Snapshot.js'

export interface State<out T> {
    readonly value: T
    (): T
}

export interface EqualityPolicy<T> {
    (a: T, b: T): boolean
}

// eslint-disable-next-line eqeqeq
function LooseEqualityPolicy<T>(a: T, b: T) { return a == b }
function StrictEqualityPolicy<T>(a: T, b: T) { return Object.is(a, b) }
function NeverEqualPolicy() { return false }

export function looseEqualityPolicy<T>(): EqualityPolicy<T> { return LooseEqualityPolicy }
export function strictEqualityPolicy<T>(): EqualityPolicy<T> { return StrictEqualityPolicy }
export function neverEqualPolicy<T>(): EqualityPolicy<T> { return NeverEqualPolicy }

export interface MutableState<T> extends State<T> {
    value: T
    (newValue: T): void
    set(newValue: T): void
    update(updater: (value: T) => T): void
}

interface MutableStateConstructor {
    new <T>(value: T, equalityPolicy?: EqualityPolicy<T>): MutableState<T>
}


// --- Implementation ---


interface MutableStateImpl<T> extends MutableState<T> {
    _value: T
    equalityPolicy: EqualityPolicy<T>
}

function getValue<T>(this: MutableStateImpl<T>): T {
    GlobalSnapshot.observeRead(this)
    return this._value
}

function setValue<T>(this: MutableStateImpl<T>, newValue: T): void {
    if (this.equalityPolicy(this._value, newValue))
        return
    this._value = newValue
    GlobalSnapshot.observeWrite(this)
}

function updateValue<T>(this: MutableStateImpl<T>, updater: (value: T) => T): void {
    const oldValue = this._value
    const newValue = updater(oldValue)
    if (this.equalityPolicy(oldValue, newValue))
        return
    this._value = newValue
    GlobalSnapshot.observeWrite(this)
}

export const MutableState: MutableStateConstructor = function<T>(
    value: T,
    equalityPolicy: EqualityPolicy<T> = strictEqualityPolicy()
) {
    const instance = function MutableStateImpl(newValue?: T) {
        if (arguments.length === 0) return instance.value
        instance.value = newValue!
    } as MutableStateImpl<T>
    instance._value = value
    instance.equalityPolicy = equalityPolicy
    instance.set = setValue.bind(instance as MutableStateImpl<unknown>)
    instance.update = updateValue.bind(instance as MutableStateImpl<unknown>) as MutableState<T>['update']
    Object.defineProperty(instance, 'value', {
        get: getValue.bind(instance as MutableStateImpl<unknown>),
        set: setValue.bind(instance as MutableStateImpl<unknown>),
        enumerable: true,
        configurable: false,
    })
    return instance
} as unknown as MutableStateConstructor
