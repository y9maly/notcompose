import type { State } from '../runtime/State.js'
import { GlobalSnapshot } from '../runtime/Snapshot.js'

export class StateDependenciesMap<
    CONSUMER extends NonNullable<unknown>,
    DIRTY_OBJECT extends NonNullable<unknown> = CONSUMER,
> {
    constructor(
        private dirtyObjectOf: (consumer: CONSUMER, writtenState: State<unknown>) => DIRTY_OBJECT | null,
        private onDirty: (object: DIRTY_OBJECT) => void,
    ) {}

    private stateConsumers = new Map<State<unknown>, Set<CONSUMER>>()
    private consumerDependencies = new Map<CONSUMER, Set<State<unknown>>>()
    public readonly dirtyObjects = new Set<DIRTY_OBJECT>()

    // Используется только во время композиции.
    // Нужно, чтобы не инвалидировать ноды, которые зависят от стейта, но ещё не прочитали старое значение.
    // todo Это должно находится не здесь. Временно пока пусть тут будет.
    private currentStateReadsMap = new Map<CONSUMER, Set<State<unknown>>>()

    //

    // todo Нужно только для currentStateReadsMap
    startNode(consumer: CONSUMER) {
        this.currentStateReadsMap.set(consumer, new Set())
    }

    // todo Нужно только для currentStateReadsMap
    endNode(consumer: CONSUMER) {
        this.currentStateReadsMap.delete(consumer)
    }

    onStateRead(consumer: CONSUMER, state: State<unknown>) {
        let set = this.currentStateReadsMap.get(consumer)
        if (set === undefined) {
            set = new Set()
            this.currentStateReadsMap.set(consumer, set)
        }
        set.add(state)

        this.addDependency(consumer, state)
        this.observeIfNotObservedYet(state)
    }

    onStatesChanged(consumer: CONSUMER, states: Set<State<unknown>>) {
        this.currentStateReadsMap.delete(consumer)
        this.clearDependencies(consumer)

        if (states.size === 0)
            return

        this.setDependencies(consumer, new Set(states))

        // Useless when we don't use clearDependencies. Because [onStateRead] already added observer for this state
        // But we are use clearDependencies.
        states.forEach(newDependency => this.observeIfNotObservedYet(newDependency))
    }

    forget(consumer: CONSUMER) {
        this.clearDependencies(consumer)
    }

    dispose() {
        this.observerDisposable?.[Symbol.dispose]()
        this.observerDisposable = null
        this.observed.clear()
        this.stateConsumers.clear()
        this.consumerDependencies.clear()
        this.currentStateReadsMap.clear()
        this.dirtyObjects.clear()
    }

    //

    private observed = new Set<State<unknown>>()
    private observerDisposable: Disposable | null = null
    private observeIfNotObservedYet(state: State<unknown>) {
        this.observed.add(state)
        if (this.observerDisposable !== null)
            return

        this.observerDisposable = GlobalSnapshot.observeStateWrites((writtenState) => {
            const consumers = this.stateConsumers.get(writtenState)
            if (consumers === undefined)
                return
            for (const consumer of consumers) {
                let canBeDirty = true
                const currentStateReads = this.currentStateReadsMap.get(consumer)
                if (currentStateReads !== undefined && !currentStateReads.has(writtenState))
                    canBeDirty = false

                if (canBeDirty) {
                    const object = this.dirtyObjectOf(consumer, writtenState)
                    if (object !== null) {
                        if (addToSet(this.dirtyObjects, object)) {
                            this.onDirty(object)
                        }
                    }
                }
            }
        })
    }

    private deleteObserver(state: State<unknown>) {
        this.observed.delete(state)
        if (this.observed.size === 0 && this.observerDisposable !== null) {
            const disposable = this.observerDisposable
            this.observerDisposable = null
            disposable[Symbol.dispose]()
        }
    }

    private addDependency(consumer: CONSUMER, dependency: State<unknown>): void {
        let dependencies = this.consumerDependencies.get(consumer)
        if (dependencies === undefined) {
            dependencies = new Set()
            this.consumerDependencies.set(consumer, dependencies)
        }
        dependencies.add(dependency)

        let consumers = this.stateConsumers.get(dependency)
        if (consumers === undefined) {
            consumers = new Set()
            this.stateConsumers.set(dependency, consumers)
        }
        consumers.add(consumer)
    }

    private clearDependencies(consumer: CONSUMER) {
        const dependencies = this.consumerDependencies.get(consumer)
        if (dependencies === undefined)
            return
        this.consumerDependencies.delete(consumer)

        dependencies.forEach(dependency => {
            const consumers = this.stateConsumers.get(dependency)!
            consumers.delete(consumer)
            if (consumers.size === 0) {
                this.stateConsumers.delete(dependency)
                this.deleteObserver(dependency)
            }
        })
    }

    private setDependencies(consumer: CONSUMER, dependencies: Set<State<unknown>>): void {
        this.consumerDependencies.set(consumer, dependencies)

        dependencies.forEach(dependency => {
            let consumers = this.stateConsumers.get(dependency)
            if (consumers === undefined) {
                consumers = new Set()
                this.stateConsumers.set(dependency, consumers)
            }
            consumers.add(consumer)
        })
    }
}

/**
 * @return true if new element was added; false if this element already existed
 */
function addToSet<T>(set: Set<T>, value: T): boolean {
    const oldSize = set.size
    set.add(value)
    const newSize = set.size
    return oldSize !== newSize
}
