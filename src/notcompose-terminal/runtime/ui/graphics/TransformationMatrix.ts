import {Float, Int} from "../../../../core/types";
import {Rect} from "../Rect";
import {Offset} from "../Offset";

export class TransformationMatrix {
    constructor(
        public readonly v00: Float, public readonly v01: Float, public readonly v02: Float, public readonly v03: Float,
        public readonly v10: Float, public readonly v11: Float, public readonly v12: Float, public readonly v13: Float,
        public readonly v20: Float, public readonly v21: Float, public readonly v22: Float, public readonly v23: Float,
        public readonly v30: Float, public readonly v31: Float, public readonly v32: Float, public readonly v33: Float,
    ) {}

    get(x: Int, y: Int): Float {
        if (x === 0) {
            if (y === 0) return this.v00
            if (y === 1) return this.v01
            if (y === 2) return this.v02
            if (y === 3) return this.v03
        } else if (x === 1) {
            if (y === 0) return this.v10
            if (y === 1) return this.v11
            if (y === 2) return this.v12
            if (y === 3) return this.v13
        } else if (x === 2) {
            if (y === 0) return this.v20
            if (y === 1) return this.v21
            if (y === 2) return this.v22
            if (y === 3) return this.v23
        } else if (x === 3) {
            if (y === 0) return this.v30
            if (y === 1) return this.v31
            if (y === 2) return this.v32
            if (y === 3) return this.v33
        }
        throw new RangeError(`${x}:${y} out of range 0..3`)
    }

    mapPoint(point: Offset): Offset
    mapPoint(x: number, y: number): Offset
    mapPoint(a: Offset | number, b?: number): Offset {
        const x = b === undefined ? (a as Offset).x : a as number
        const y = b === undefined ? (a as Offset).y : b as number

        const pW = 1 / (this.v30 * x + this.v31 * y + this.v33)
        return new Offset(pW * (this.v00 * x + this.v01 * y + this.v03), pW * (this.v10 * x + this.v11 * y + this.v13))
    }

    mapRect(rect: Rect): Rect {
        const l = rect.left
        const t = rect.top
        const r = rect.right
        const b = rect.bottom

        let x = l
        let y = t
        let inverseZ = 1 / (this.v30 * x + this.v31 * y + this.v33)
        let pZ = inverseZ
        const x0 = pZ * (this.v00 * x + this.v01 * y + this.v03)
        const y0 = pZ * (this.v10 * x + this.v11 * y + this.v13)

        x = l
        y = b
        inverseZ = 1 / (this.v30 * x + this.v31 * y + this.v33)
        pZ = inverseZ
        const x1 = pZ * (this.v00 * x + this.v01 * y + this.v03)
        const y1 = pZ * (this.v10 * x + this.v11 * y + this.v13)

        x = r
        y = t
        inverseZ = 1 / (this.v30 * x + this.v31 * y + this.v33)
        pZ = inverseZ
        const x2 = pZ * (this.v00 * x + this.v01 * y + this.v03)
        const y2 = pZ * (this.v10 * x + this.v11 * y + this.v13)

        x = r
        y = b
        inverseZ = 1 / (this.v30 * x + this.v31 * y + this.v33)
        pZ = inverseZ
        const x3 = pZ * (this.v00 * x + this.v01 * y + this.v03)
        const y3 = pZ * (this.v10 * x + this.v11 * y + this.v13)

        return new Rect(
            Math.min(x0, x1, x2, x3),
            Math.min(y0, y1, y2, y3),
            Math.max(x0, x1, x2, x3),
            Math.max(y0, y1, y2, y3),
        )
    }

    timesBy(otherMatrix: TransformationMatrix): TransformationMatrix {
        return new TransformationMatrix(
            dot(this, 0, otherMatrix, 0),
            dot(this, 0, otherMatrix, 1),
            dot(this, 0, otherMatrix, 2),
            dot(this, 0, otherMatrix, 3),
            dot(this, 1, otherMatrix, 0),
            dot(this, 1, otherMatrix, 1),
            dot(this, 1, otherMatrix, 2),
            dot(this, 1, otherMatrix, 3),
            dot(this, 2, otherMatrix, 0),
            dot(this, 2, otherMatrix, 1),
            dot(this, 2, otherMatrix, 2),
            dot(this, 2, otherMatrix, 3),
            dot(this, 3, otherMatrix, 0),
            dot(this, 3, otherMatrix, 1),
            dot(this, 3, otherMatrix, 2),
            dot(this, 3, otherMatrix, 3),
        )
    }

    toString(): string {
        return `|${this.v00} ${this.v01} ${this.v02} ${this.v03}|\n` +
            `|${this.v10} ${this.v11} ${this.v12} ${this.v13}|\n` +
            `|${this.v20} ${this.v21} ${this.v22} ${this.v23}|\n` +
            `|${this.v30} ${this.v31} ${this.v32} ${this.v33}|\n`
    }

    invert(): TransformationMatrix | null {
        const b00 = this.v00 * this.v11 - this.v01 * this.v10
        const b01 = this.v00 * this.v12 - this.v02 * this.v10
        const b02 = this.v00 * this.v13 - this.v03 * this.v10
        const b03 = this.v01 * this.v12 - this.v02 * this.v11
        const b04 = this.v01 * this.v13 - this.v03 * this.v11
        const b05 = this.v02 * this.v13 - this.v03 * this.v12
        const b06 = this.v20 * this.v31 - this.v21 * this.v30
        const b07 = this.v20 * this.v32 - this.v22 * this.v30
        const b08 = this.v20 * this.v33 - this.v23 * this.v30
        const b09 = this.v21 * this.v32 - this.v22 * this.v31
        const b10 = this.v21 * this.v33 - this.v23 * this.v31
        const b11 = this.v22 * this.v33 - this.v23 * this.v32

        const det = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06)
        if (det === 0)
            return this

        const invDet = 1 / det
        return new TransformationMatrix(
            (this.v11 * b11 - this.v12 * b10 + this.v13 * b09) * invDet,
            (-this.v01 * b11 + this.v02 * b10 - this.v03 * b09) * invDet,
            (this.v31 * b05 - this.v32 * b04 + this.v33 * b03) * invDet,
            (-this.v21 * b05 + this.v22 * b04 - this.v23 * b03) * invDet,
            (-this.v10 * b11 + this.v12 * b08 - this.v13 * b07) * invDet,
            (this.v00 * b11 - this.v02 * b08 + this.v03 * b07) * invDet,
            (-this.v30 * b05 + this.v32 * b02 - this.v33 * b01) * invDet,
            (this.v20 * b05 - this.v22 * b02 + this.v23 * b01) * invDet,
            (this.v10 * b10 - this.v11 * b08 + this.v13 * b06) * invDet,
            (-this.v00 * b10 + this.v01 * b08 - this.v03 * b06) * invDet,
            (this.v30 * b04 - this.v31 * b02 + this.v33 * b00) * invDet,
            (-this.v20 * b04 + this.v21 * b02 - this.v23 * b00) * invDet,
            (-this.v10 * b09 + this.v11 * b07 - this.v12 * b06) * invDet,
            (this.v00 * b09 - this.v01 * b07 + this.v02 * b06) * invDet,
            (-this.v30 * b03 + this.v31 * b01 - this.v32 * b00) * invDet,
            (this.v20 * b03 - this.v21 * b01 + this.v22 * b00) * invDet,
        )
    }
}

function dot(m1: TransformationMatrix, row: Int, m2: TransformationMatrix, column: Int): Float {
    return m1.get(row, 0) * m2.get(0, column) +
        m1.get(row, 1) * m2.get(1, column) +
        m1.get(row, 2) * m2.get(2, column) +
        m1.get(row, 3) * m2.get(3, column)
}
