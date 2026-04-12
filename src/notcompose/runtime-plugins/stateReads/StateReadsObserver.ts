import {Node} from "../../runtime/Node";
import {State} from "../../runtime/State";
import {StateReads} from "./StateReads";


// Отслеживает изменение StateReads у ноды.
export interface StateReadsObserver {
    // Вызывается сразу как [node] во время её композиции прочитала [state]
    // Вызвается только в первое чтение.
    onStateRead(node: Node, state: State<unknown>): void

    // Вызвается когда композиция [node] закончилась.
    // [state] - все стейты которая читала эта нода.
    onStatesChanged(node: Node, states: StateReads): void

    // Вызывается для удалённых из композиции нод
    onNodeCleared(node: Node): void
}
