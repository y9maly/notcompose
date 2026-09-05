import { currentComposer } from '../composer/currentComposer.js'

export function SideEffect(block: () => void) {
    currentComposer().exitComposition()
    block()
    currentComposer().reenterComposition()
}
