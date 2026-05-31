import {State} from "../../runtime/State";
import {NodeExtensionKey} from "../../runtime/NodeExtensionKey";

// Public Api
export const StateReadsExtensionKey = new NodeExtensionKey<StateReads>('StateReads')
export type StateReads = Set<State<unknown>>
