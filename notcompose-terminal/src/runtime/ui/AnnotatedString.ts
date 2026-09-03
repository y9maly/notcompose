import { BackgroundColorTextSpan, BoldTextSpan, ColorTextSpan, ItalicTextSpan, StrikethroughTextSpan, TextSpan, type TextSpanType, UnderlineTextSpan } from './TextSpan.js'
import { Color } from './Color.js'

export class AnnotatedString {
    public readonly length: number

    constructor(
        public readonly string: string = '',
        public readonly spans: ReadonlyArray<TextSpan> = [],
    ) {
        this.length = string.length
        spans.forEach(span => {
            if (span.end > string.length)
                throw new RangeError(`end cannot be greater than string length`)
        })
    }

    plus(other: string | AnnotatedString): AnnotatedString {
        if (typeof other === 'string')
            return new AnnotatedString(this.string + other, this.spans)

        return new AnnotatedString(
            this.string + other.string,
            [...this.spans, ...other.spans.map(it => it.offset(this.length))]
        )
    }
}

// --- Builder ---

export const colored = (color: Color | null, text: string | AnnotatedString) => annotated(text, new ColorTextSpan(color))
export const backgroundColored = (color: Color, text: string | AnnotatedString) => annotated(text, new BackgroundColorTextSpan(color))
export const bold = (text: string | AnnotatedString) => annotated(text, BoldTextSpan)
export const italic = (text: string | AnnotatedString) => annotated(text, ItalicTextSpan)
export const underline = (text: string | AnnotatedString) => annotated(text, UnderlineTextSpan)
export const strikethrough = (text: string | AnnotatedString) => annotated(text, StrikethroughTextSpan)

export function annotated(
    text: string | AnnotatedString,
    ...types: ReadonlyArray<TextSpanType>
): AnnotatedString

export function annotated(
    strings: TemplateStringsArray,
    ...values: ReadonlyArray<string | AnnotatedString>
): AnnotatedString

export function annotated(
    a: string | AnnotatedString | TemplateStringsArray,
    ...b: ReadonlyArray<TextSpanType> | ReadonlyArray<string | AnnotatedString>
): AnnotatedString {
    if (Array.isArray(a))
        return annotatedBuilder(a as any, b as any)
    return annotatedChunk(a as any, b)
}

function annotatedChunk(
    string: string | AnnotatedString,
    types: ReadonlyArray<TextSpanType>
): AnnotatedString {
    return new AnnotatedString(
        typeof string === 'string'
            ? string
            : string.string,
        typeof string === 'string'
            ? types.map(it => new TextSpan(it, 0, string.length))
            : [...types.map(it => new TextSpan(it, 0, string.length)), ...string.spans],
    )
}

function annotatedBuilder(
    strings: TemplateStringsArray,
    values: ReadonlyArray<string | AnnotatedString>
): AnnotatedString {
    let length = 0
    const result = []
    const resultSpans: TextSpan[] = []

    for (let i = 0; i < strings.length; i++) {
        length += strings[i].length
        result.push(strings[i])

        if (i >= values.length)
            continue

        const value = values[i]
        if (typeof value === 'string') {
            length += value.length
            result.push(value)
            continue
        }

        const start = length
        length += value.length
        result.push(value.string)

        for (const span of value.spans) {
            resultSpans.push(span.offset(start))
        }
    }

    return new AnnotatedString(result.join(''), resultSpans)
}
