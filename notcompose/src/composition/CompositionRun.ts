import { type CompositionSession, CompositionSessionDefault } from './CompositionSession.js'
import type { Node } from '../runtime/Node.js'
import type { CompositionPlugin } from './CompositionPlugin.js'

export interface CompositionRun {
    readonly debugInformation?: string
    readonly compositionRoot: Node
    readonly session: CompositionSession

    readonly isInComposition: boolean
    leaveComposition(): void
    reenterComposition(): void
}

export class CompositionRunDefault implements CompositionRun {
    constructor(
        public readonly compositionRoot: Node,
        public readonly session: CompositionSessionDefault,
        private readonly plugins: ReadonlyArray<CompositionPlugin>,
        public readonly debugInformation?: string,
    ) {}

    private isStarted = false
    private isFinished = false
    private leaves = 0
    public isInComposition = false

    leaveComposition() {
        if (!this.isStarted)
            throw new Error(`'leaveComposition' can be called only after 'start'`)
        if (this.isFinished)
            throw new Error(`'leaveComposition' can't be called after 'finish'`)
        this.leaves++
        this.isInComposition = false

        this.plugins.forEach(plugin => plugin.onLeave?.(this))
    }

    reenterComposition() {
        if (!this.isStarted)
            throw new Error(`'reenterComposition' can be called only after 'start'`)
        if (this.isFinished)
            throw new Error(`'reenterComposition' can't be called after 'finish'`)
        if (this.isInComposition)
            throw new Error(`'reenterComposition' can be called only after 'leaveComposition'`)
        this.leaves--
        if (this.leaves === 0) {
            this.isInComposition = true

            this.plugins.forEach(plugin => plugin.onReenter?.(this))
        }
    }

    start() {
        if (this.isStarted)
            throw new Error(`'start' can be called only once`)
        this.isStarted = true
        this.isInComposition = true
    }

    finish() {
        if (!this.isStarted)
            throw new Error(`'finish' can be called only after 'start'`)
        if (this.isFinished)
            throw new Error(`'finish' can be called only once`)
        this.isInComposition = false
        this.isFinished = true
    }
}
