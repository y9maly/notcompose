import {State} from "../../runtime/State";

// Public Api
export const StateReadsExtensionKey = Symbol('StateReadsExtensionKey')
export type StateReads = Set<State<unknown>>
