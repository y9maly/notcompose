import {Node} from "../../notcompose/runtime/Node";
import {NodeCoordinator} from "../runtime-layout/NodeCoordinator";
import {TextCanvas} from "../runtime/ui/graphics/TextCanvas";
import {TextBuffer, TextBufferCanvas, TextCell, TextRow} from "../runtime/ui/graphics/TextBufferCanvas";
import {Char} from "../../core/types";
import {DebugTextSpanProcessor, TextSpanProcessor} from "./TextSpanProcessor";
import {LayoutNode} from "../runtime-layout/LayoutNode";
import {LayoutNodeExtensionKey} from "../runtime/nodeExtensions/LayoutNodeExtension";


export interface OutputProcessor {
    doFrame(node: Node, width: number, height: number): void
}

export class StringOutputProcessor implements OutputProcessor {
    constructor(
        private onFrame: (string: string) => void,
        private spanProcessor: TextSpanProcessor = new DebugTextSpanProcessor(),
    ) {}

    private canvas = new TextBufferCanvas(new TextBuffer([]), 0, 0)

    doFrame(node: Node, width: number, height: number): void {
        this.canvas = new TextBufferCanvas(new TextBuffer([]), width, height)
        const textRows = this.canvas.buffer.rows
        const rows: string[] = []

        for (let y = 0; y < height; y++) {
            if (textRows[y] === undefined)
                textRows[y] = new TextRow([])
            for (let x = 0; x < width; x++) {
                if (textRows[y].cells.at(x) === undefined)
                    textRows[y].cells[x] = new TextCell(' ' as Char, [])
            }
        }

        materialize(node, this.canvas)

        let output = []

        for (let y = 0; y < textRows.length; y++) {
            const rawRow = new Array(width)
            this.spanProcessor.transform(textRows[y], rawRow)
            let rowString = rawRow.join('')
            rows.push(rowString)
        }

        output.push(rows.join('\n'))

        this.onFrame(output.join(''))
    }
}

export class ConsoleOutputProcessor implements OutputProcessor {
    constructor(
        private stream: NodeJS.WriteStream,
        private options?: {
            before?: () => void,
            after?: () => void,
        }
    ) {}

    private stringProcessor = new StringOutputProcessor(
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

    doFrame(node: Node, width: number, height: number): void {
        this.stringProcessor.doFrame(node, width, height)
    }

    draw(string: string) {
        this.stream.cursorTo(0, 0)
        this.stream.write(string)
    }
}

function materialize(node: Node, canvas: TextCanvas) {
    const layoutNode = node.extensions.get(LayoutNodeExtensionKey) as LayoutNode | undefined
    if (layoutNode === undefined) {
        throw new Error(`Root node is not a layout node`)
    } else {
        layoutNode.draw(canvas)
    }
}
