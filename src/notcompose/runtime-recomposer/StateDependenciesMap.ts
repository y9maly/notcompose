import {State} from "../runtime/State";
import {GlobalSnapshot} from "../runtime/Snapshot";


export class StateDependenciesMap<
    CONSUMER extends NonNullable<unknown>,
    DIRTY_OBJECT extends NonNullable<unknown> = CONSUMER,
> {
    constructor(
        private dirtyObjectOf: (consumer: CONSUMER) => DIRTY_OBJECT,
        private onDirty: (object: DIRTY_OBJECT) => void,
    ) {}

    private stateConsumers = new Map<State<unknown>, Set<CONSUMER>>()
    private consumerDependencies = new Map<CONSUMER, Set<State<unknown>>>()
    private observers = new Map<State<unknown>, Disposable>()
    public readonly dirtyObjects = new Set<DIRTY_OBJECT>()

    //

    onStateRead(consumer: CONSUMER, state: State<unknown>) {
        this.addDependency(consumer, state)
        this.observeIfNotObservedYet(state)
    }

    onStatesChanged(consumer: CONSUMER, states: Set<State<unknown>>) {
        this.clearDependencies(consumer)
        if (states.size === 0)
            return

        this.setDependencies(consumer, states)

        const deletedDependencies = new Set<State<unknown>>(this.consumerDependencies.get(consumer) ?? [])
        states.forEach(newDependency => deletedDependencies.delete(newDependency))

        // Useless because [onStateRead] already added observer for this state
        // states.forEach(newDependency => this.observeIfNotObservedYet(newDependency))

        deletedDependencies.forEach(deletedDependency => {
            if ((this.stateConsumers.get(deletedDependency)?.size ?? -1) === 0)
                this.deleteObserver(deletedDependency)
        })
    }

    forget(consumer: CONSUMER) {
        this.clearDependencies(consumer)
    }

    //

    private observeIfNotObservedYet(state: State<unknown>) {
        if (this.observers.has(state)) {
            return
        }

        const observer = GlobalSnapshot.observeStateWrites((writtenState) => {
            if (writtenState !== state)
                return
            const consumers = this.stateConsumers.get(state)
            if (consumers === undefined)
                throw new Error(`Must be unreachable; This state observed but it doesn't have any consumer`)
            for (const consumer of consumers) {
                const object = this.dirtyObjectOf(consumer)
                if (addToSet(this.dirtyObjects, object)) {
                    this.onDirty(object)
                }
            }
        })

        this.observers.set(state, observer)
    }

    private deleteObserver(state: State<unknown>) {
        this.observers.get(state)?.[Symbol.dispose]()
        this.observers.delete(state)
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
            if (consumers.size === 0)
                this.stateConsumers.delete(dependency)
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
