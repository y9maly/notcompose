import {State} from "../../runtime/State";


// Public Api
export const StateReadsExtensionKey = Symbol('StateReadsExtensionKey')
export type StateReads = Set<State<unknown>>


// Internal Plugin Api
export const __TemporalStateReadsExtensionKey = Symbol('__TemporalStateReadsExtensionKey')
export type __TemporalStateReads = Set<State<unknown>>
