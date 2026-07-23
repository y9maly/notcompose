import { State } from '../../runtime/State.js'
import { GlobalSnapshot } from '../../runtime/Snapshot.js'

export class StateReadsCollector<CONSUMER extends NonNullable<unknown>> {
    private temporalStateReadsMap = new Map<CONSUMER, Set<State<unknown>>>()
    private disposable: Disposable | null = null

    constructor(
        private readonly current: () => CONSUMER | null,
        private readonly onStateRead: (state: State<unknown>, consumer: CONSUMER) => void = () => {},
    ) {}

    start() {
        if (this.disposable !== null)
            throw new Error(`Start cannot be called twice`)

        this.disposable = GlobalSnapshot.observeStateReads((state) => {
            const current = this.current()
            if (current === null)
                throw new Error('Current cannot be null because observer must be disposed when [stop] called and [start] was called and [stop] was not called yet')
            const stateReads = this.temporalStateReadsMap.get(current)
            if (stateReads === undefined) return
            if (addToSet(stateReads, state))
                this.onStateRead(state, current)
        })
    }

    stop() {
        if (this.disposable === null)
            throw new Error(`Stop cannot be called before start`)
        this.disposable[Symbol.dispose]()
        this.disposable = null
    }

    initialize(consumer: CONSUMER) {
        let stateReads = this.temporalStateReadsMap.get(consumer)
        if (stateReads !== undefined)
            throw new Error('initTemporal called twice')
        stateReads = new Set()
        this.temporalStateReadsMap.set(consumer, stateReads)
    }

    release(consumer: CONSUMER): Set<State<unknown>> {
        const finalStateReads = this.temporalStateReadsMap.get(consumer)
        if (finalStateReads === undefined)
            throw new Error('Must be unreachable')
        this.temporalStateReadsMap.delete(consumer)
        return finalStateReads
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
