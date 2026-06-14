import {Float} from "../../../core/types.js";

export interface RectLike {
    left?: Float // default 0
    top?: Float // default 0
    right?: Float // default 0
    bottom?: Float // default 0
}

export class Rect {
    public readonly left: Float
    public readonly top: Float
    public readonly right: Float
    public readonly bottom: Float

    constructor(left: Float, top: Float, right: Float, bottom: Float)
    constructor(like: RectLike)
    constructor(a: any, b?: any, c?: any, d?: any) {
        if (typeof a === 'object') {
            this.left = a.left ?? 0
            this.top = a.top ?? 0
            this.right = a.right ?? 0
            this.bottom = a.bottom ?? 0
        } else {
            this.left = a
            this.top = b
            this.right = c
            this.bottom = d
        }
    }
}
