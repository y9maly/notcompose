import {AnnotatedString} from "notcompose/terminal";

export interface TestOutput {
    viewportWidth: number
    viewportHeight: number
    lastOutput?: AnnotatedString[]
    lastOutputWidth: number
    lastOutputHeight: number
}
