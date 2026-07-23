import { Float } from '../../../core/types.js'

export interface OffsetLike {
    x?: Float // default 0
    y?: Float // default 0
}

export class Offset {
    public readonly x: Float
    public readonly y: Float

    constructor(like: OffsetLike)
    constructor(x: Float, y: Float)
    constructor(a: any, b?: any) {
        if (typeof a === 'object') {
            this.x = a.x ?? 0
            this.y = a.y ?? 0
        } else {
            this.x = a
            this.y = b
        }
    }

    static ZERO = new Offset(0, 0)

    equals(other: Offset) {
        return this.x === other.x && this.y === other.y
    }
}
