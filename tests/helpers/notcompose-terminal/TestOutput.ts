import {AnnotatedString} from "../../../src/notcompose-terminal/runtime/ui/AnnotatedString";

export interface TestOutput {
    viewportWidth: number
    viewportHeight: number
    lastOutput?: AnnotatedString[]
    lastOutputWidth: number
    lastOutputHeight: number
}
