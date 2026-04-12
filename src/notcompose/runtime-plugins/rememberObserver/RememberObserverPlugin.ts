import {PartialComposerPlugin} from "../../runtime/ComposerPlugin";
import {Node} from "../../runtime/Node";
import {RememberObserver} from "./RememberObserver";
import {Key} from "../../runtime/Composer";


export class RememberObserverPlugin implements PartialComposerPlugin {
    onValueRemembered(node: Node, value: unknown) {
        RememberObserver.of(value)?.onRemembered()
    }

    onKeyedValueRemembered(node: Node, key: Key, value: unknown) {
        RememberObserver.of(value)?.onRemembered()
    }

    onValueUpdated(node: Node, oldValue: unknown, newValue: unknown) {
        if (!Object.is(oldValue, newValue)) {
            RememberObserver.of(oldValue)?.onForgotten()
            RememberObserver.of(newValue)?.onRemembered()
        }
    }

    onKeyedValueUpdated(node: Node, key: Key, oldValue: unknown, newValue: unknown) {
        if (!Object.is(oldValue, newValue)) {
            RememberObserver.of(oldValue)?.onForgotten()
            RememberObserver.of(newValue)?.onRemembered()
        }
    }

    onValueForgotten(node: Node, lastValue: unknown) {
        RememberObserver.of(lastValue)?.onForgotten()
    }

    onKeyedValueForgotten(node: Node, key: Key, lastValue: unknown) {
        RememberObserver.of(lastValue)?.onForgotten()
    }

    onNodeForgotten(node: Node) {
        const stack = [node]

        while (stack.length > 0) {
            const deleted = stack.pop()!

            deleted.positionalRemembered.forEach(it =>
                this.onValueForgotten(deleted, it)
            )

            deleted.keyedRemembered.forEach((value, key) =>
                this.onKeyedValueForgotten(deleted, key, value)
            )

            for (let i = 0; i < deleted.children.length; i++) {
                stack.push(deleted.children[i].node)
            }
        }
    }
}
