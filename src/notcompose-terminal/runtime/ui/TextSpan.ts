import {Color} from "./Color";

export class TextSpan {
    constructor(
        public readonly type: TextSpanType,
        public readonly start: number,
        public readonly length: number,
    ) {
        if (start < 0)
            throw new RangeError(`start cannot be negative but got ${start}`)
        if (length < 0)
            throw new RangeError(`length cannot be negative but got ${length}`)
    }

    get end() { return this.start + this.length }

    offset(offset: number): TextSpan {
        return this.copy({ start: this.start + offset })
    }

    copy(overrides: { type?: TextSpanType, start?: number, length?: number }): TextSpan
    copy(overrides: { type?: TextSpanType, start?: number, end?: number }): TextSpan
    copy(overrides: { type?: TextSpanType, start?: number, length?: number, end?: number }): TextSpan {
        const type = overrides.type ?? this.type
        const start = overrides.start ?? this.start
        const length = overrides.length ?? (overrides.end !== undefined ? overrides.end - start : this.length)
        return new TextSpan(type, start, length)
    }
}

export type TextSpanType = unknown



export class BackgroundColorTextSpan {
    constructor(public readonly color: Color | null) {}
}

export class ColorTextSpan {
    constructor(public readonly color: Color | null) {}
}

export const BoldTextSpan: TextSpanType = {}
export const ItalicTextSpan: TextSpanType = {}
export const UnderlineTextSpan: TextSpanType = {}
export const StrikethroughTextSpan: TextSpanType = {}
