import {Node} from "./Node.js";
import {Key} from "./Composer.js";
import {ComposerPluginContext} from "./ComposerPluginContext";

/**
 * Composer вызывает на плагинах калбеки, передавая ноды.
 *
 * Например [RecomposePlugin] при входе в композицию ноды запускает SnapshotState.observeReads,
 * чтобы записать какие стейты читаются при композиции это ноды.
 * Потом это используется, например, для рекомпозиции.
 *
 * ```
 *      onNodeCreated────────────────┐
 *           │                       │
 *           ▼                       │
 * ┌───►onNodeStarted─────────────┐  │
 * │         │                    │  │
 * │         ▼                    │  │
 * │  ┌►onNodeCompositionStarted  │  │
 * │  │      │                    │  │
 * │  │      ▼                    │  │
 * │  │ onNodeCompositionEnded────┼──┼──┐
 * │  │      │                    │  │  │
 * │  │      ▼                    │  │  │
 * └──┴─onNodeEnded◄──────────────┘  │  │
 *           │                       │  │
 *           ▼                       │  │
 *      onNodeForgotten◄─────────────┘◄─┘
 * ```
 *
 * * Переход 'onNodeCompositionEnded -> onNodeForgotten' возможен только если композиция была запущена вне [startNode]-[endNode]
 *   (Например SubcomposeLayout запускает композицию ноды уже после создания ноды, в фазе layout/measurement)
 */
export interface ComposerPlugin {
    attach(context: ComposerPluginContext): void

    // Вызывается когда появляется самая первая root-нода (Появляется первый frame в ComposerImpl)
    // Вызывается ДО [onStartRootNode]
    initially(): void
    // Вызывается когда заканчивается самая первая root-нода (Исчезает последний frame в ComposerImpl)
    // Вызывается ПОСЛЕ [onEndRootNode]
    finally(): void

    // Вызывается после startComposingWithRootNode.
    onStartRootNode(node: Node): void
    // Вызывается при выходе из композиции. После этого может вызваться ТОЛЬКО reenterComposition.
    exitComposition(): void
    // Вызывается при повторном входе в композицию. Вызывается ТОЛЬКО после exitComposition.
    reenterComposition(): void
    // Вызывается после endComposingWithRootNode.
    onEndRootNode(node: Node): void

    // Вызывается при создании дочерней ноды [node] (когда в первый раз появляется в композиции) (startNode)
    onNodeCreated(node: Node): void
    // Вызывается при вставке дочерней ноды [node] (insertNode)
    onNodeInserted(node: Node): void
    // Вызывается когда эта нода удаляется из её родительской.
    onNodeForgotten(node: Node): void

    // Вызывается после вызова startNode() (Для всех нод кроме корневой для текущей композиции)
    onStartNode(node: Node): void
    // Вызывается после вызова endNode() (Для всех нод кроме корневой для текущей композиции)
    onEndNode(node: Node): void

    // Вызывается когда эта нода начинает композироваться (Если используется lateCompose, то вызовется после onNodeEnded)
    // Кроме первой ноды в композиции.
    onNodeCompositionStarted(node: Node): void
    // Вызывается когда эта нода заканчивает композироваться (Если используется lateCompose, то вызовется после onNodeEnded)
    // Кроме первой ноды в композиции.
    onNodeCompositionEnded(node: Node): void

    // Вызывается когда запоминается значение в первый раз
    onValueRemembered(node: Node, value: unknown): void
    onKeyedValueRemembered(node: Node, key: Key, value: unknown): void
    // Вызывается когда значение обновляется (Например если используется remember с ключами и ключи поменялись)
    onValueUpdated(node: Node, oldValue: unknown, newValue: unknown): void
    onKeyedValueUpdated(node: Node, key: Key, oldValue: unknown, newValue: unknown): void
    // Вызывается когда значение забывается (Например когда remember выходит из композиции)
    // Вызывается только при рекомпозиции ноды, и только если она не была удалена.
    // Если нужно обработать ВСЕ забываемые значения, то нужно явно обрабатывать onNodeForgotten.
    onValueForgotten(node: Node, lastValue: unknown): void
    onKeyedValueForgotten(node: Node, key: Key, lastValue: unknown): void
}

export interface PartialComposerPlugin {
    attach?(context: ComposerPluginContext): void
    initially?(): void
    finally?(): void
    onStartRootNode?(node: Node): void
    exitComposition?(): void
    reenterComposition?(): void
    onEndRootNode?(node: Node): void
    onNodeCreated?(node: Node): void
    onNodeInserted?(node: Node): void
    onNodeForgotten?(node: Node): void
    onStartNode?(node: Node): void
    onEndNode?(node: Node): void
    onNodeCompositionStarted?(node: Node): void
    onNodeCompositionEnded?(node: Node): void
    onValueRemembered?(node: Node, value: unknown): void
    onKeyedValueRemembered?(node: Node, key: Key, value: unknown): void
    onValueUpdated?(node: Node, oldValue: unknown, newValue: unknown): void
    onKeyedValueUpdated?(node: Node, key: Key, oldValue: unknown, newValue: unknown): void
    onValueForgotten?(node: Node, lastValue: unknown): void
    onKeyedValueForgotten?(node: Node, key: Key, lastValue: unknown): void
}

function NoOp() {}

export function PartialComposerPlugin(plugin: PartialComposerPlugin): ComposerPlugin {
    return {
        attach: plugin.attach?.bind(plugin) ?? NoOp,
        initially: plugin.initially?.bind(plugin) ?? NoOp,
        finally: plugin.finally?.bind(plugin) ?? NoOp,
        onStartRootNode: plugin.onStartRootNode?.bind(plugin) ?? NoOp,
        exitComposition: plugin.exitComposition?.bind(plugin) ?? NoOp,
        reenterComposition: plugin.reenterComposition?.bind(plugin) ?? NoOp,
        onEndRootNode: plugin.onEndRootNode?.bind(plugin) ?? NoOp,
        onNodeCreated: plugin.onNodeCreated?.bind(plugin) ?? NoOp,
        onNodeInserted: plugin.onNodeInserted?.bind(plugin) ?? NoOp,
        onNodeForgotten: plugin.onNodeForgotten?.bind(plugin) ?? NoOp,
        onStartNode: plugin.onStartNode?.bind(plugin) ?? NoOp,
        onEndNode: plugin.onEndNode?.bind(plugin) ?? NoOp,
        onNodeCompositionStarted: plugin.onNodeCompositionStarted?.bind(plugin) ?? NoOp,
        onNodeCompositionEnded: plugin.onNodeCompositionEnded?.bind(plugin) ?? NoOp,
        onValueRemembered: plugin.onValueRemembered?.bind(plugin) ?? NoOp,
        onKeyedValueRemembered: plugin.onKeyedValueRemembered?.bind(plugin) ?? NoOp,
        onValueUpdated: plugin.onValueUpdated?.bind(plugin) ?? NoOp,
        onKeyedValueUpdated: plugin.onKeyedValueUpdated?.bind(plugin) ?? NoOp,
        onValueForgotten: plugin.onValueForgotten?.bind(plugin) ?? NoOp,
        onKeyedValueForgotten: plugin.onKeyedValueForgotten?.bind(plugin) ?? NoOp,
    }
}
