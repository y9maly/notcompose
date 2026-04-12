import {Node} from "../../notcompose/runtime/Node";
import {InputModifier} from "../runtime/modifiers/InputModifier";


export interface InputDispatcher {
    dispatch(string: string, key: unknown): boolean
}

export class RootInputDispatcher implements InputDispatcher {
    constructor(
        private rootNode: () => Node
    ) {}

    dispatch(string: string, key: unknown): boolean {
        const nodeQueue = [this.rootNode()]
        while (nodeQueue.length > 0) {
            const node = nodeQueue.shift()!

            for (const modifier of node.modifier.elements) {
                const inputModifier = InputModifier.of(modifier)
                if (inputModifier === null)
                    continue
                if (inputModifier.process(string, key))
                    return true
            }

            const next = node.children.map(it => it.node)
            next.reverse()
            nodeQueue.push(...next)
        }

        return false
    }
}
