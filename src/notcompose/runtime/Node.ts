import {Key} from "./Composer.js";
import {Modifier} from "./Modifier.js";
import {NodeExtension} from "./NodeExtension.js";
import {NameElement} from "./modifiers/NameElement.js";


export class Node {
    constructor(
        public parent: Node | null,
        public modifier: Modifier,
        public readonly children: { key: Key | null, node: Node }[] = [],
        public readonly positionalRemembered: unknown[] = [],
        public readonly keyedRemembered: Map<Key, unknown> = new Map(),
        public readonly extensions: Map<symbol, NodeExtension> = new Map(),
    ) {}

    findName(): string | null {
        return this.modifier.elements.find(it => it instanceof NameElement)?.name ?? null
    }
}
