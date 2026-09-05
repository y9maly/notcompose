import { outsideComposition } from '../composition/currentCompositionRun.js'

export function SideEffect(block: () => void) {
    outsideComposition(block)
}
