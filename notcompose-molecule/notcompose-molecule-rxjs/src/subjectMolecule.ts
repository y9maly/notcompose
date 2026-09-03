import { BehaviorSubject } from 'rxjs'
import { GlobalSnapshot } from '@notcompose/core'
import { runMolecule } from '@notcompose/molecule'

export function subjectMolecule<T>(content: () => T): BehaviorSubject<T> {
    const state = runMolecule(content)
    const behaviorSubject = new BehaviorSubject<T>(state.value)
    GlobalSnapshot.observeStateWrites((writtenState) => {
        if (state === writtenState) {
            GlobalSnapshot.withoutReadObservation(() => {
                behaviorSubject.next(state.value)
            })
        }
    })
    return behaviorSubject
}
