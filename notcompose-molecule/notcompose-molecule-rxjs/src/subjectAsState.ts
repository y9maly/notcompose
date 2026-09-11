import type { State } from '@notcompose/core'
import { BehaviorSubject } from 'rxjs'
import { observableAsState } from './observableAsState.js'

export function subjectAsState<T>(subject: BehaviorSubject<T>): State<T> {
    return observableAsState(subject, subject.value)
}
