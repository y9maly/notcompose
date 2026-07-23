import { State } from '../../runtime/State.js'
import { NodeExtensionKey } from '../../runtime/NodeExtensionKey.js'

// Public Api
export const StateReadsExtensionKey = new NodeExtensionKey<StateReads>('StateReads')
export type StateReads = Set<State<unknown>>
