import type { Observable } from 'rxjs'
import { DisposableEffect, rememberState, type State } from '@notcompose/core'

export function observableAsState<T>(observable: Observable<T>, initialValue: T): State<T> {
    const state = rememberState(() => initialValue)
    DisposableEffect([observable], () => {
        const sub = observable.subscribe(value => state.value = value)
        return () => sub.unsubscribe()
    })
    return state
}
