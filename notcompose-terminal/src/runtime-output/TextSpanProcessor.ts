import { TextRow } from '../runtime/ui/graphics/TextBufferCanvas.js'
import { BackgroundColorTextSpan, BoldTextSpan, ColorTextSpan, UnderlineTextSpan } from '../runtime/ui/TextSpan.js'


export interface TextSpanProcessor {
    transform(row: TextRow, destination: string[]): void
}


export class DebugTextSpanProcessor implements TextSpanProcessor {
    transform(row: TextRow, destination: string[]): void {
        row.cells.forEach((cell, x) => {
            destination[x] = cell.char
        })

        row.cells
            .flatMap((it, x) => ({ spans: it.spans, x }))
            .forEach(({ spans, x }) => {
                spans.forEach(span => {
                    if (span === BoldTextSpan) {
                        destination[x] =
                            '\x1b[1m' +
                            destination[x] +
                            '\x1b[22m'
                    } else if (span === UnderlineTextSpan) {
                        destination[x] =
                            '\x1b[4m' +
                            destination[x] +
                            '\x1b[24m'
                    } else if (span instanceof BackgroundColorTextSpan) {
                        if (span.color !== null) {
                            destination[x] =
                                `\x1b[48;2;${span.color.red};${span.color.green};${span.color.blue}m` +
                                destination[x] +
                                '\x1b[49m'
                        } else {
                            destination[x] = '\x1b[49m' + destination[x]
                        }
                    } else if (span instanceof ColorTextSpan) {
                        if (span.color !== null) {
                            destination[x] =
                                `\x1b[38;2;${span.color.red};${span.color.green};${span.color.blue}m` +
                                destination[x] +
                                '\x1b[39m'
                        } else {
                            destination[x] = '\x1b[39m' + destination[x]
                        }
                    }
                })
            })
    }
}
