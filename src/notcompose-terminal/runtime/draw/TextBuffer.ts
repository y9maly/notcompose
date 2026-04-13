import {AnnotatedString} from "./AnnotatedString";
import {TextCanvas} from "./TextCanvas";
import {assertInt} from "../../../notcompose/utils/assertInt";


export class TextBuffer implements TextCanvas {
    constructor(
        public readonly buffer: string[][],
        public width: number,
        public height: number,
    ) {}

    private localX = 0
    private localY = 0

    resetTranslate() {
        this.localX = this.localY = 0
    }

    translate(x: number, y: number) {
        this.localX += x
        this.localY += y
    }

    drawText(x: number, y: number, string: string | AnnotatedString): void {
        assertInt(x, y)

        if (typeof string === 'string') {
            insertText(this.buffer, this.width, this.height, string, x + this.localX, y + this.localY)
        } else {
            insertText(this.buffer, this.width, this.height, string.string, x + this.localX, y + this.localY)
        }
    }
}

function insertText(buffer: string[][], maxWidth: number, maxHeight: number, string: string, x: number, y: number) {
    assertInt(maxWidth, maxHeight, x, y)

    let cx = x
    let cy = y

    for (let chi = 0; chi < string.length; chi++) {
        const ch = string[chi]

        if (ch === '\n') {
            cy++
            cx = x
            continue
        }

        if (cy >= maxHeight)
            break
        if (cx >= maxWidth)
            continue

        while (buffer.length <= cy)
            buffer.push([])

        while (buffer[cy].length <= cx)
            buffer[cy].push(' ')

        buffer[cy][cx] = ch

        cx += ch.length
    }
}
