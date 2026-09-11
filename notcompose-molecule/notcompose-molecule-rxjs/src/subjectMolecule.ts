import { BehaviorSubject } from 'rxjs'
import { runMolecule } from '@notcompose/molecule'
import { GlobalSnapshot } from '@notcompose/core'

export function subjectMolecule<T>(content: () => T): [BehaviorSubject<T>, dispose: () => void]
export function subjectMolecule<T>(signal: AbortSignal, content: () => T): BehaviorSubject<T>
export function subjectMolecule<T>(a: AbortSignal | (() => T), b?: () => T): BehaviorSubject<T> | [BehaviorSubject<T>, dispose: () => void] {
    if (arguments.length === 2)
        return subjectMoleculeImpl(a as AbortSignal, b!)
    const abortController = new AbortController()
    const state = subjectMoleculeImpl(abortController.signal, a as () => T)
    return [state, () => abortController.abort()]
}

function subjectMoleculeImpl<T>(signal: AbortSignal, content: () => T): BehaviorSubject<T> {
    const [state, disposeState] = runMolecule(content)
    const behaviorSubject = new BehaviorSubject<T | undefined>(undefined)

    const abortPromise = new Promise<true>((resolve) => {
        signal.addEventListener('abort', () => resolve(true), { once: true })
        if (signal.aborted) resolve(true)
    })

    let sent = false
    const observeWritesDisposable = GlobalSnapshot.observeStateWrites((writtenState) => {
        if (writtenState === state) {
            sent = true
            behaviorSubject.next(state.value)
        }
    })

    if (!sent) {
        behaviorSubject.next(state.value)
    }

    void abortPromise.finally(() => {
        disposeState()
        observeWritesDisposable[Symbol.dispose]()
    })

    return behaviorSubject as BehaviorSubject<T>
}
