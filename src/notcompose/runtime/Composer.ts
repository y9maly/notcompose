import {Node} from "./Node.js";
import {Modifier} from "./Modifier.js";
import {NodeExtension} from "./NodeExtension.js";
import {ComposerPlugin, PartialComposerPlugin} from "./ComposerPlugin.js";
import {ComposerPluginContext} from "./ComposerPluginContext";


export type Key = number | string

export interface Frame {
    isCompositionRoot: boolean
    node: Node
    key: Key | null
    composingState: 'NotComposed' | 'Composing' | 'Composed' // Initially 'NotComposed'
    childrenFrames: Frame[]

    usedPositionalChildren: number // Initially 0
    usedKeyedChildren: Set<Key>

    usedPositionalRemembered: number // Initially 0
    usedKeyedRemembered: Set<Key>
}

export interface IComposer {}

const Empty = Symbol('Empty')

/**
 * Composer позволяет строить плоские деревья при помощи плоских вложенных вызовов.
 * Управляет удалением/добавлением дочерних Node, мемоизирует значения (remember)
 *
 * Root-нодой считается самая первая нода в корневой композиции. (frames[0])
 * Composition-root нодой считается первая ноды в текущем дереве композиции. (frames.first(it => it.isCompositionRoot))
 * Дерево композиции начинается с помощью [startRootNode] и заканчивается с помощью [endRootNode].
 * Вызовы [startRootNode]/[endRootNode] могут быть вложенными - создается новое дерево композиции.
 *
 * Все [startRootNode] должна быть закончены только с помощью [endRootNode].
 * Все [startNode] должна быть закончены только с помощью [endNode].
 *
 * Любое дерево может быть достроено позже, в том числе пока происходит композиция другого дерева.
 * Например это используется в SubcomposeLayout, чтобы запустить композицию в момент layout/measure фазы.
 *
 * Композиция ноды - это запуск "тела" ноды, в рамках которого происходит чтение стейта, compositionLocal, запуск дочерних нод.
 *
 * Начать построение дерева нужно с корня, для этого нужно вызвать [startRootNode].
 * По окончании нужно завершить построение при помощи [endRootNode].
 *
 * [startNode] (Запуск ноды) - это использование уже существующей ноды у родительской ноды
 *                             либо создание, если в предыдущей композииции этой ноды не было либо это первая композиция.
 *                             Создаёт новую ноду в рамках текущей ноды и сразу переходит в её контекст.
 * [endNode] (Завершение ноды) - закончить "настройку" ноды и окончательно добавить её в родителя.
 */
export class Composer implements IComposer {
    composer = this
    context = {
        composer: this.composer,
        currentCompositionRootNode() { return this.composer.currentCompositionRootNode }
    } satisfies ComposerPluginContext

    private frames: Frame[] = []
    private compositionRootFrames: (Frame & { isCompositionRoot: true })[] = []
    private exitedComposition = false

    private readonly plugins: ReadonlyArray<ComposerPlugin>
    constructor(
        plugins: ReadonlyArray<ComposerPlugin | PartialComposerPlugin>,
    ) {
        this.plugins = plugins.map(it => PartialComposerPlugin(it))
        this.plugins.forEach(plugin => plugin.attach(this.context))
    }

    get currentCompositionRootFrame(): Frame | null { return this.compositionRootFrames.length === 0 ? null : this.compositionRootFrames[this.compositionRootFrames.length - 1] }
    get currentCompositionRootNode(): Node | null { return this.currentCompositionRootFrame?.node ?? null }
    get currentFrame(): Frame | null { return this.frames.length === 0 ? null : this.frames[this.frames.length - 1] }
    get currentNode(): Node | null { return this.currentFrame?.node ?? null }

    private ensureInComposition(actionName?: string) {
        if (this.exitedComposition)
            throw new Error(`Cannot ${actionName ?? 'do this'} because exited composition`)
    }

    exitComposition() {
        if (this.exitedComposition)
            throw new Error('Cannot exit composition because already exited')
        if (this.frames.length === 0)
            throw new Error('Cannot exit composition because there is no active composition')
        this.exitedComposition = true
        this.plugins.forEach(plugin => plugin.exitComposition())
    }

    reenterComposition() {
        if (!this.exitedComposition)
            throw new Error('Cannot reenter composition because already in composition')
        this.exitedComposition = false
        this.plugins.forEach(plugin => plugin.reenterComposition())
    }

    startRootNode(node: Node) {
        this.ensureInComposition()

        const frame: (Frame & { isCompositionRoot: true }) = {
            isCompositionRoot: true,
            node: node,
            key: null,
            composingState: 'NotComposed',
            childrenFrames: [],
            usedPositionalChildren: 0,
            usedKeyedChildren: new Set(),
            usedPositionalRemembered: 0,
            usedKeyedRemembered: new Set(),
        } as const
        this.frames.push(frame)
        this.compositionRootFrames.push(frame)

        if (this.frames.length === 1)
            this.plugins.forEach(plugin => plugin.initially())
        this.plugins.forEach(plugin => plugin.onStartRootNode(node))
    }

    endRootNode() {
        this.ensureInComposition()
        const frame = this.currentFrame
        if (frame === null)
            throw new Error('Could not end root node here: No frames')
        if (!frame.isCompositionRoot)
            throw new Error('Could not end root node here: Current frame is not root')
        this.frames.pop()
        const rootFrame = this.compositionRootFrames.pop()
        if (frame !== rootFrame)
            throw new Error('Must be unreachable: frame !== rootFrame')
        if (rootFrame.composingState === 'Composing')
            throw new Error(`Cannot end root node here: Composition is still active. Do you forgot to call 'endComposingNode'?`)

        this.plugins.forEach(plugin => plugin.onEndRootNode(rootFrame.node))
        if (this.frames.length === 0)
            this.plugins.forEach(plugin => plugin.finally())
    }

    // start new children node.
    // If node at this position or with this key already exists - it reused
    // Otherwise new node instance was created
    startNode(modifier: Modifier): void
    startNode(modifier: Modifier, key: Key): void
    startNode(modifier: Modifier, key?: Key): void {
        this.ensureInComposition()
        const parentFrame = this.currentFrame
        if (parentFrame === null)
            throw new Error('Could not start node here')

        let node: Node | null; {
            node = key === undefined ? this.nextNode() : this.nextNode(key)

            if (node === null) {
                node = new Node(parentFrame.node, modifier)
                this.plugins.forEach(plugin => plugin.onNodeCreated(node!))
            } else {
                node.modifier = modifier
            }
        }

        if (key === undefined) {
            parentFrame.usedPositionalChildren++
        } else {
            parentFrame.usedKeyedChildren.add(key)
        }

        const frame: Frame = {
            isCompositionRoot: false,
            key: key ?? null,
            node: node,
            composingState: 'NotComposed',
            childrenFrames: [],
            usedPositionalChildren: 0,
            usedKeyedChildren: new Set(),
            usedPositionalRemembered: 0,
            usedKeyedRemembered: new Set(),
        }

        parentFrame.childrenFrames.push(frame)
        this.frames.push(frame)

        this.plugins.forEach(plugin => plugin.onStartNode(node))
    }

    // Вставить эту ноду + обновить её родителя на текущую ноду
    insertNode(node: Node): void
    insertNode(node: Node, key: Key): void
    insertNode(node: Node, key?: Key) {
        this.ensureInComposition()
        const parentFrame = this.currentFrame
        if (parentFrame === null)
            throw new Error('Could not insert node here')
        node.parent = parentFrame.node

        if (key === undefined) {
            parentFrame.usedPositionalChildren++
        } else {
            parentFrame.usedKeyedChildren.add(key)
        }

        const frame: Frame = {
            isCompositionRoot: false,
            key: key ?? null,
            node: node,
            composingState: 'NotComposed',
            childrenFrames: [],
            usedPositionalChildren: 0,
            usedKeyedChildren: new Set(),
            usedPositionalRemembered: 0,
            usedKeyedRemembered: new Set(),
        }

        parentFrame.childrenFrames.push(frame)
        this.frames.push(frame)

        this.plugins.forEach(plugin => plugin.onNodeInserted(node))
    }

    startComposingNode() {
        this.ensureInComposition()
        if (this.currentFrame === null)
            throw new Error('Cannot start composing node here')
        this.currentFrame.composingState = 'Composing'
        this.plugins.forEach(plugin => plugin.onNodeCompositionStarted(this.currentNode!))
    }

    endComposingNode() {
        this.ensureInComposition()
        if (this.currentFrame === null)
            throw new Error('Cannot end composing node here')
        if (this.currentFrame.composingState !== 'Composing')
            throw new Error(`Cannot end composing node here: Composition is not active. Do you forgot to call 'startComposingNode'?`)
        this.currentFrame.composingState = 'Composed'

        const childFrame = this.currentFrame
        const childNode = childFrame.node

        // Update all children nodes
        const deletedChildren: Node[] = []
        {
            const oldChildren = childNode.children
            const newFrames = childFrame.childrenFrames
            const newNodesSet = new Set(newFrames.map(it => it.node))

            for (let i = 0; i < oldChildren.length; i++) {
                if (!newNodesSet.has(oldChildren[i].node)) {
                    deletedChildren.push(oldChildren[i].node)
                }
            }

            for (let i = 0; i < newFrames.length; i++) {
                const frame = newFrames[i]
                if (oldChildren[i]) {
                    oldChildren[i].key = frame.key
                    oldChildren[i].node = frame.node
                } else {
                    oldChildren[i] = { key: frame.key, node: frame.node }
                }
            }

            oldChildren.length = newFrames.length
        }

        // Remove unclaimed positional remembered values
        {
            childNode.positionalRemembered.splice(childFrame.usedPositionalRemembered)
                .forEach(it =>
                    this.plugins.forEach(plugin => plugin.onValueForgotten(childNode, it))
                )
        }

        // Remove unclaimed keyed remembered values
        {
            for (const [key, value] of childNode.keyedRemembered) {
                if (!childFrame.usedKeyedRemembered.has(key)) {
                    childNode.keyedRemembered.delete(key)
                    this.plugins.forEach(plugin => plugin.onKeyedValueForgotten(childNode, key, value))
                }
            }
        }

        deletedChildren.forEach(forgottenNode => {
            this.plugins.forEach(plugin => plugin.onNodeForgotten(forgottenNode))
        })

        this.plugins.forEach(plugin => plugin.onNodeCompositionEnded(this.currentNode!))
    }

    // Получить следующую довернюю ноду этой ноды.
    // @returns null если такой ноды нет.
    // Всегда null для первой композиции.
    nextNode(): Node | null
    nextNode(key: Key): Node | null
    nextNode(key?: Key): Node | null {
        this.ensureInComposition()
        const parentFrame = this.currentFrame
        if (parentFrame === null)
            throw new Error(`Node doesn't exits`)

        // Если у ноды нету ключа, то использовать следующий usedPositionalChildren.
        // Если есть ключ, то найти по ключу.
        if (key === undefined) {
            if (parentFrame.node.children.length > parentFrame.usedPositionalChildren) {
                const positionalIndex = parentFrame.usedPositionalChildren
                let index = 0
                for (const it of parentFrame.node.children) {
                    if (it.key !== null)
                        continue
                    if (index === positionalIndex)
                        return it.node
                    index++
                }
            }
        } else {
            return parentFrame.node.children.find(it => it.key === key)?.node ?? null
        }

        return null
    }

    applyExtension(key: symbol, value: NodeExtension): void {
        this.ensureInComposition()
        if (this.currentFrame === null)
            throw new Error('Could not apply extension here')
        this.currentFrame.node.extensions.set(key, value)
    }

    endNode(): void {
        if (this.currentFrame === null)
            throw new Error('Cound not end node here')
        if (this.currentFrame.isCompositionRoot)
            throw new Error('Cound not end root node')
        if (this.currentFrame.composingState === 'Composing')
            throw new Error(`Cannot end root node here: Composition is still active. Do you forgot to call 'endComposingNode'?`)
        const node = this.frames.pop()!.node

        this.plugins.forEach(plugin => plugin.onEndNode(node))
    }

    // ------ Remember

    hasRememberedValue(): boolean {
        return this.currentNode!.positionalRemembered.length > this.currentFrame!.usedPositionalRemembered
    }

    hasRememberedKeyedValue(key: Key): boolean {
        return this.currentNode!.keyedRemembered.has(key)
    }

    rememberedValue(): unknown {
        if (!this.hasRememberedValue())
            throw new Error('No remembered value')
        return this.currentNode!.positionalRemembered[this.currentFrame!.usedPositionalRemembered]
    }

    nextRememberedValue(): unknown {
        if (!this.hasRememberedValue())
            throw new Error('No remembered value')
        return this.currentNode!.positionalRemembered[this.currentFrame!.usedPositionalRemembered++]
    }

    rememberedKeyedValue(key: Key): unknown {
        if (!this.hasRememberedKeyedValue(key))
            throw new Error(`No remembered value with key ${key}`)
        return this.currentNode!.keyedRemembered.get(key)
    }

    rememberValue(newValue: unknown): void {
        this.ensureInComposition()
        const oldValue: unknown = this.hasRememberedValue()
            ? this.currentNode!.positionalRemembered[this.currentFrame!.usedPositionalRemembered]
            : Empty
        this.currentNode!.positionalRemembered[this.currentFrame!.usedPositionalRemembered++] = newValue

        if (oldValue === Empty) {
            this.plugins.forEach(plugin => plugin.onValueRemembered(this.currentNode!, newValue))
        } else {
            this.plugins.forEach(plugin => plugin.onValueUpdated(this.currentNode!, oldValue, newValue))
        }
    }

    rememberKeyedValue(key: Key, newValue: unknown) {
        this.ensureInComposition()
        const oldValue: unknown = this.hasRememberedKeyedValue(key)
            ? this.currentNode!.keyedRemembered.get(key)
            : Empty
        this.currentNode!.keyedRemembered.set(key, newValue)

        if (oldValue === Empty) {
            this.plugins.forEach(plugin => plugin.onKeyedValueRemembered(this.currentNode!, key, newValue))
        } else {
            this.plugins.forEach(plugin => plugin.onKeyedValueUpdated(this.currentNode!, key, oldValue, newValue))
        }
    }
}
