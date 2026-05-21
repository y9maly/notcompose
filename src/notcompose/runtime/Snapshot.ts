import {State} from "./State";


const stateReadObservers = new Set<(state: State<unknown>) => void>()
const stateWriteObservers = new Set<(state: State<unknown>) => void>()

export class GlobalSnapshot {
    private static disableReadObservation = false

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
        const observersSnapshot = [...stateWriteObservers]

        for (const observer of observersSnapshot) {
            if (stateWriteObservers.has(observer)) {
                observer(state)
            }
        }
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
}
