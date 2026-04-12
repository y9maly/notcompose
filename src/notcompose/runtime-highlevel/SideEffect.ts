import {currentComposer} from "../runtime/currentComposer.js";


export function SideEffect(block: () => void) {
    currentComposer().exitComposition()
    block()
    currentComposer().reenterComposition()
}
