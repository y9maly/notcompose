import {TextSpan} from "./TextSpan";


export class AnnotatedString {
    constructor(
        public readonly string: string,
        public readonly spans: ReadonlyArray<TextSpan>,
    ) {
        spans.forEach(span => {
            if (span.end > string.length)
                throw new RangeError(`end cannot be greater than string length`)
        })
    }
}
