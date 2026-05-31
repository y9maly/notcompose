import {Node} from "../../notcompose/runtime/Node";
import {TextCanvas} from "../runtime/ui/graphics/TextCanvas";
import {TextBuffer, TextBufferCanvas, TextCell, TextRow} from "../runtime/ui/graphics/TextBufferCanvas";
import {Char} from "../../core/types";
import {DebugTextSpanProcessor, TextSpanProcessor} from "./TextSpanProcessor";
import {LayoutNode} from "../runtime-layout/LayoutNode";
import {LayoutNodeExtensionKey} from "../runtime/nodeExtensions/LayoutNodeExtension";
import {BehaviorSubject} from "rxjs";

export interface OutputProcessor {
    // todo Subject to change
    viewportSize: BehaviorSubject<[number, number]>

    doFrame(node: Node, width: number, height: number): void
}

export class RawOutputProcessor implements OutputProcessor {
    constructor(
        public viewportSize: BehaviorSubject<[number, number]>,
        private onFrame: (rows: TextRow[], width: number, height: number, node: Node) => void,
    ) {}

    private canvas = new TextBufferCanvas(new TextBuffer([]), 0, 0)

    doFrame(node: Node, width: number, height: number): void {
        this.canvas = new TextBufferCanvas(new TextBuffer([]), width, height)
        const textRows = this.canvas.buffer.rows

        for (let y = 0; y < height; y++) {
            if (textRows[y] === undefined)
                textRows[y] = new TextRow([])
            for (let x = 0; x < width; x++) {
                if (textRows[y].cells.at(x) === undefined)
                    textRows[y].cells[x] = new TextCell(' ' as Char, [])
            }
        }

        materialize(node, this.canvas)

        this.onFrame(textRows, width, height, node)
    }
}

export class StringOutputProcessor implements OutputProcessor {
    private raw: OutputProcessor

    constructor(
        public viewportSize: BehaviorSubject<[number, number]>,
        private onFrame: (string: string) => void,
        private spanProcessor: TextSpanProcessor = new DebugTextSpanProcessor(),
    ) {
        this.raw = new RawOutputProcessor(this.viewportSize, (textRows, width) => {
            const rows: string[] = []

            let output = []

            for (let y = 0; y < textRows.length; y++) {
                const rawRow = new Array(width)
                this.spanProcessor.transform(textRows[y], rawRow)
                let rowString = rawRow.join('')
                rows.push(rowString)
            }

            output.push(rows.join('\n'))

            this.onFrame(output.join(''))
        })
    }

    doFrame(node: Node, width: number, height: number): void {
        this.raw.doFrame(node, width, height)
    }
}

export class ConsoleOutputProcessor implements OutputProcessor {
    public viewportSize: BehaviorSubject<[number, number]>
    private stringProcessor: StringOutputProcessor

    constructor(
        private stream: NodeJS.WriteStream,
        private options?: {
            onResize?: (width: number, height: number) => void,
            before?: () => void,
            after?: () => void,
        }
    ) {
        this.viewportSize = new BehaviorSubject([process.stdout.columns, process.stdout.rows])
        // todo memory leak
        process.stdout.on('resize', () => {
            this.viewportSize.next([process.stdout.columns, process.stdout.rows])
            this.options?.onResize?.(process.stdout.columns, process.stdout.rows)
        })

        this.stringProcessor = new StringOutputProcessor(
            this.viewportSize,
            // todo
            // new CombinedTextSpanProcessor([
            //     new BoldTextSpanProcessor(),
            //     new BackgroundColorTextSpanProcessor(),
            //     new ColorTextSpanProcessor(),
            //     new UnderlineTextSpanProcessor(),
            // ]),
            (string) => {
                this.options?.before?.()
                this.draw(string)
                this.options?.after?.()
            }
        )
    }

    doFrame(node: Node, width: number, height: number): void {
        this.stringProcessor.doFrame(node, width, height)
    }

    draw(string: string) {
        this.stream.cursorTo(0, 0)
        this.stream.write(string)
    }
}

function materialize(node: Node, canvas: TextCanvas) {
    const layoutNode = node.getExtension(LayoutNodeExtensionKey)
    if (layoutNode === undefined) {
        throw new Error(`Root node is not a layout node`)
    } else {
        layoutNode.draw(canvas)
    }
}
