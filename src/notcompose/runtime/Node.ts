import { Key } from './Composer.js'
import { Modifier } from './Modifier.js'
import { NameElement } from './modifiers/NameElement.js'
import { NodeExtensionKey } from './NodeExtensionKey.js'

export class Node {
    constructor(
        public parent: Node | null,
        public modifier: Modifier,
        public readonly children: { key: Key | null, node: Node }[] = [],
        public readonly positionalRemembered: unknown[] = [],
        public readonly keyedRemembered: Map<Key, unknown> = new Map(),
        public readonly extensions: Map<symbol, unknown> = new Map(),
    ) {}

    hasExtension(key: NodeExtensionKey<unknown>): boolean {
        return this.extensions.has(key.symbol)
    }

    setExtension<T>(key: NodeExtensionKey<T>, value: T) {
        this.extensions.set(key.symbol, value)
    }

    getExtension<T>(key: NodeExtensionKey<T>): T | undefined {
        return this.extensions.get(key.symbol) as T | undefined
    }

    deleteExtension(key: NodeExtensionKey<unknown>) {
        return this.extensions.delete(key.symbol)
    }

    findName(): string | null {
        return this.modifier.elements.find(it => it instanceof NameElement)?.name ?? null
    }

    walkDFS(block: (node: Node) => void) {
        const stack: { key: any, node: Node }[] = [{ key: null, node: this }]
        while (stack.length > 0) {
            const { node } = stack.pop()!
            block(node)
            stack.push(...node.children)
        }
    }

    walkChildrenDFS(block: (node: Node) => void) {
        const stack = [...this.children]
        while (stack.length > 0) {
            const { node } = stack.pop()!
            block(node)
            stack.push(...node.children)
        }
    }
}
