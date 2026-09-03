import { DisposableEffect, rememberState, type State } from '@notcompose/core'
import { BehaviorSubject } from 'rxjs'

export function subjectAsState<T>(subject: BehaviorSubject<T>): State<T> {
    const state = rememberState(() => subject.value)
    DisposableEffect([subject], () => {
        const sub = subject.subscribe(value => { state.value = value })
        return () => sub.unsubscribe()
    })
    return state
}
