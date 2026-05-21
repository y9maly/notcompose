import {BehaviorSubject, Subject} from "rxjs";
import {runMolecule} from "../core/runMolecule";
import {GlobalSnapshot} from "../../notcompose/runtime/Snapshot";

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
