import {State} from "./State";

const stateReadObservers = new Set<(state: State<unknown>) => void>()
const stateWriteObservers = new Set<(state: State<unknown>) => void>()

export class GlobalSnapshot {
    private static disableReadObservation = false
    private static disableWriteObservation = false

    static observeStateReads(callback: (state: State<unknown>) => void): Disposable {
        stateReadObservers.add(callback)
        return {
            [Symbol.dispose](): void { stateReadObservers.delete(callback) }
        }
    }

    static observeStateWrites(callback: (state: State<unknown>) => void): Disposable {
        stateWriteObservers.add(callback)
        return {
            [Symbol.dispose](): void { stateWriteObservers.delete(callback) }
        }
    }

    static observeRead(state: State<unknown>) {
        if (this.disableReadObservation)
            return
        const observersSnapshot = [...stateReadObservers]

        for (const observer of observersSnapshot) {
            if (stateReadObservers.has(observer)) {
                observer(state)
            }
        }
    }

    static observeWrite(state: State<unknown>) {
        if (this.disableWriteObservation)
            return
        const observersSnapshot = [...stateWriteObservers]

        for (const observer of observersSnapshot) {
            if (stateWriteObservers.has(observer)) {
                observer(state)
            }
        }
    }

    static withoutReadWriteObservation<T>(content: () => T): T {
        if (this.disableReadObservation && this.disableWriteObservation)
            return content()
        const oldDisableReadObservation = this.disableReadObservation
        const oldDisableWriteObservation = this.disableWriteObservation
        this.disableReadObservation = true
        this.disableWriteObservation = true
        let value: T
        try {
            value = content()
        } finally {
            this.disableReadObservation = oldDisableReadObservation
            this.disableWriteObservation = oldDisableWriteObservation
        }
        return value
    }

    static withoutReadObservation<T>(content: () => T): T {
        if (this.disableReadObservation)
            return content()
        this.disableReadObservation = true
        let value: T
        try {
            value = content()
        } finally {
            this.disableReadObservation = false
        }
        return value
    }

    static withoutWriteObservation<T>(content: () => T): T {
        if (this.disableWriteObservation)
            return content()
        this.disableWriteObservation = true
        let value: T
        try {
            value = content()
        } finally {
            this.disableWriteObservation = false
        }
        return value
    }

    // static recordStateReads(): () => Set<State<unknown>>
    // static recordStateReads(block: () => void): Set<State<unknown>>
    // static recordStateReads(block?: () => void) {
    //     if (block !== undefined) {
    //         const finalize = this.recordStateReads()
    //         block()
    //         return finalize()
    //     }
    //
    //     const set = new Set<State<unknown>>()
    //     const dispose: Disposable = GlobalSnapshot.observeStateReads(state => set.add(state))
    //     let disposed = false
    //     return () => {
    //         if (disposed)
    //             throw new Error('This can be called only once!')
    //         dispose[Symbol.dispose]()
    //         disposed = true
    //         return set
    //     }
    // }
}
