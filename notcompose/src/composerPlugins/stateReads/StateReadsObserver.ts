import { Node } from '../../runtime/Node.js'
import type { State } from '../../runtime/State.js'
import type { StateReads } from './StateReads.js'

// Отслеживает изменение StateReads у ноды.
export interface StateReadsObserver {
    // Вызывается сразу как [node] во время её композиции прочитала [state]
    // Вызвается только в первое чтение.
    onStateRead(node: Node, state: State<unknown>): void

    // Вызвается когда композиция [node] закончилась.
    // [state] - все стейты которая читала эта нода.
    onStatesChanged(node: Node, states: StateReads): void

    // Вызывается когда эта нода удаляется из её родительской.
    // Вызывается только для корня удалённого поддерева. Все дочерние ноды нужно обойти явно, если требуется обработать каждую.
    onNodeForgotten(node: Node): void
}
