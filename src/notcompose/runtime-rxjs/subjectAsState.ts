import {BehaviorSubject} from "rxjs";
import {State} from "../runtime/State.js";
import {rememberState} from "../runtime-highlevel/rememberState.js";
import {DisposableEffect} from "../runtime-highlevel/DisposableEffect.js";

export function subjectAsState<T>(subject: BehaviorSubject<T>): State<T> {
    const state = rememberState(() => subject.value)
    DisposableEffect([subject], () => {
        const sub = subject.subscribe(value => { state.value = value })
        return () => sub.unsubscribe()
    })
    return state
}
