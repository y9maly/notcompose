import { Observable } from 'rxjs'
import { GlobalSnapshot } from '@notcompose/core'
import { runMolecule } from '@notcompose/molecule'

export function observableMolecule<T>(content: () => T): Observable<T> {
    return new Observable((subscriber) => {
        const [state, disposeState] = runMolecule(content)

        let sent = false
        const observeWritesDisposable = GlobalSnapshot.observeStateWrites((writtenState) => {
            if (writtenState === state) {
                const value = state.value
                sent = true
                subscriber.next(value)
            }
        })

        if (!sent) {
            subscriber.next(state.value)
        }

        return () => {
            disposeState()
            observeWritesDisposable[Symbol.dispose]()
        }
    })
}
