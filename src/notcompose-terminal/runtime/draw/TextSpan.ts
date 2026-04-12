import {Color} from "../ui/Color";


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
}

export interface TextSpanType {}



export class BackgroundColorTextSpan implements TextSpanType {
    constructor(public readonly color: Color) {}
}

export class ColorTextSpan implements TextSpanType {
    constructor(public readonly color: Color) {}
}

export const BoldTextSpan: TextSpanType = {}
export const ItalicTextSpan: TextSpanType = {}
export const UnderlineTextSpan: TextSpanType = {}
export const StrikethroughTextSpan: TextSpanType = {}
