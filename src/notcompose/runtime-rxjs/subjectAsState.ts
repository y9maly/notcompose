import {BehaviorSubject, Subject} from "rxjs";
import {State} from "../runtime/State";
import {rememberState} from "../runtime-highlevel/rememberState";
import {DisposableEffect} from "../runtime-highlevel/DisposableEffect";

export function subjectAsState<T>(subject: BehaviorSubject<T>): State<T> {
    const state = rememberState(() => subject.value)
    DisposableEffect([subject], () => {
        const sub = subject.subscribe(value => { state.value = value })
        return () => sub.unsubscribe()
    })
    return state
}
