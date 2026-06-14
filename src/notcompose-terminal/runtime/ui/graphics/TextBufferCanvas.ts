import {AnnotatedString} from "../AnnotatedString.js";
import {TextCanvas} from "./TextCanvas.js";
import {TextSpanType} from "../TextSpan.js";
import {Char, Float} from "../../../../core/types.js";
import {TransformationMatrix} from "./TransformationMatrix.js";
import {Rect, Size} from "notcompose/layout";

export class TextBufferCanvas implements TextCanvas {
    constructor(
        public readonly buffer: TextBuffer,
        public width: number,
        public height: number,
        public readonly config: {
            drawThreshold: number
        } = {
            drawThreshold: 0.5,
        }
    ) {}

    get size() { return new Size(this.width, this.height) }

    private _invertMatrix: TransformationMatrix | null = null
    private _matrix = new TransformationMatrix(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    )

    private get invertMatrix() {
        if (this._invertMatrix === null) this._invertMatrix = this.matrix.invert()
        return this._invertMatrix!
    }

    private get matrix() { return this._matrix }
    private set matrix(value: TransformationMatrix) {
        this._matrix = value
        this._invertMatrix = null
    }

    private saveStack: TransformationMatrix[] = []

    save() {
        this.saveStack.push(this.matrix)
    }

    restore() {
        this.localX = this.localY = 0
        if (this.saveStack.length === 0)
            throw new Error("Nothing to restore")
        this.matrix = this.saveStack.pop()!
    }

    concat(matrix: TransformationMatrix) {
        this.matrix = this.matrix.timesBy(matrix)
    }

    private localX = 0
    private localY = 0
    translate(dx: Float, dy: Float) {
        this.localX += dx
        this.localY += dy

        this.matrix = this.matrix.timesBy(new TransformationMatrix(
            1, 0, 0, dx,
            0, 1, 0, dy,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ))
    }

    scale(scale: Float):void
    scale(scaleX: Float, scaleY: Float):void
    scale(scaleX: Float, scaleY?: Float) {
        scaleY = scaleY ?? scaleX

        this.matrix = this.matrix.timesBy(new TransformationMatrix(
            scaleX, 0, 0, 0,
            0, scaleY, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ))
    }

    skew(sx: Float, sy: Float) {
        this.matrix = this.matrix.timesBy(new TransformationMatrix(
            1, sx, 0, 0,
            sy, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ))
    }

    skewRad(sxRad: Float, syRad: Float) {
        this.skew((180.0 / Math.PI) * sxRad, (180.0 / Math.PI) * syRad)
    }

    rotate(degrees: number) {
        this.rotateRad((degrees * Math.PI) / 180)
    }

    rotateRad(rad: Float) {
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)

        this.matrix = this.matrix.timesBy(new TransformationMatrix(
            cos, -sin, 0, 0,
            sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ))
    }

    clipRect() {
        // todo
    }

    clipOutRect() {
        // todo
    }

    drawText(x: number, y: number, text: string | AnnotatedString): void {
        const rawString = typeof text === 'string' ? text : text.string
        const width = rawString.length
        const height = 1

        const localRect = new Rect(x, y, x + width, y + height)
        const screenRect = this.matrix.mapRect(localRect)

        const minX = Math.max(0, Math.floor(screenRect.left))
        const maxX = Math.min(this.width - 1, Math.floor(screenRect.right))
        const minY = Math.max(0, Math.floor(screenRect.top))
        const maxY = Math.min(this.height - 1, Math.floor(screenRect.bottom))

        for (let ry = minY; ry <= maxY; ry++) {
            for (let rx = minX; rx <= maxX; rx++) {
                const { x: localX, y: localY } = this.invertMatrix.mapPoint(rx + 0.5, ry + 0.5)

                if (localX >= x && localX < x + width &&
                    localY >= y && localY < y + height) {

                    const charIndex = Math.floor(localX - x)
                    const char = Char(rawString[charIndex])
                    const spans = text instanceof AnnotatedString ? text.spans : []

                    // todo Уважать this.config.drawThreshold
                    this.buffer.rows[ry].cells[rx] = new TextCell(
                        char,
                        spans
                            .filter(it => it.start <= charIndex && it.end > charIndex)
                            .map(it => it.type)
                    )
                }
            }
        }
    }
}

export class TextBuffer {
    constructor(
        public readonly rows: TextRow[],
    ) {}
}

export class TextRow {
    constructor(
        public readonly cells: TextCell[],
    ) {}
}

export class TextCell {
    constructor(
        public readonly char: Char,
        public readonly spans: TextSpanType[],
    ) {}
}

function maxLineLength(string: string): number {
    let max = 0
    let lineLength = 0
    for (const char of string) {
        if (char === '\n') {
            max = Math.max(max, lineLength)
            lineLength = 0
        } else {
            lineLength++
        }
    }
    return Math.max(max, lineLength)
}

function linesCount(string: string): number {
    let result = 1
    for (const char of string)
        if (char === '\n') result++
    return result
}
