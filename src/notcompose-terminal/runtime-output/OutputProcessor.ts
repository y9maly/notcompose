import {Node} from "../../notcompose/runtime/Node";
import {TextCanvas} from "../runtime/ui/graphics/TextCanvas";
import {TextBuffer, TextBufferCanvas, TextCell, TextRow} from "../runtime/ui/graphics/TextBufferCanvas";
import {Char} from "../../core/types";
import {DebugTextSpanProcessor, TextSpanProcessor} from "./TextSpanProcessor";
import {BehaviorSubject} from "rxjs";
import {LayoutNode, LayoutNodeExtensionKey} from "../../notcompose-layout/runtime/layoutNode/LayoutNode";
import {LayoutNodeCoordinator} from "../../notcompose-layout/runtime/layoutNode/LayoutNodeCoordinator";
import {LayoutModifier} from "../../notcompose-layout/runtime/modifiers/LayoutModifier";
import {LayoutModifierLayoutNodeCoordinator} from "../../notcompose-layout/runtime/layoutNode/LayoutModifierLayoutNodeCoordinator";
import {DrawModifier} from "../runtime/modifiers/DrawModifier";
import {ContentDrawScope} from "../runtime/ui/graphics/ContentDrawScope";
import {DrawScope} from "../runtime/ui/graphics/DrawScope";
import {Key} from "../../notcompose/runtime/Composer";
import {MeasurePolicyExtensionKey} from "../../notcompose-layout/runtime/nodeExtensions/MeasurePolicyNodeExtension";
import {SubcomposeNodeExtensionKey} from "../../notcompose-layout/runtime/nodeExtensions/SubcomposeNodeExtension";
import {applyLayoutNode as newApplyLayoutNode} from "../../notcompose-layout/runtime/layoutNode/applyLayoutNode";

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
    }

    let currentCoordinator = layoutNode.outerCoordinator
    while (true) {
        drawCoordinator(currentCoordinator, canvas)

        if (currentCoordinator instanceof LayoutModifierLayoutNodeCoordinator)
            currentCoordinator = currentCoordinator.nextCoordinator
        else
            break
    }
}

function drawCoordinator(coordinator: LayoutNodeCoordinator, canvas: TextCanvas) {
    if (!coordinator.isPlaced)
        return

    let nextDrawModifierIndex = coordinator.modifierElements
        .findIndex(it => DrawModifier.is(it))
    const nextDrawModifierLambda = () => {
        if (nextDrawModifierIndex === -1)
            return nextDrawLambdaOf(coordinator, canvas)

        const nextDrawModifier = DrawModifier.of(coordinator.modifierElements[nextDrawModifierIndex])!
        nextDrawModifierIndex = coordinator.modifierElements
            .findIndex((it, index) => index > nextDrawModifierIndex && DrawModifier.is(it))
        return () => {
            canvas.save()
            nextDrawModifier.draw(ContentDrawScope(DrawScope(canvas, coordinator.width, coordinator.height), nextDrawModifierLambda()))
            canvas.restore()
        }
    }

    canvas.translate(coordinator.x, coordinator.y)
    nextDrawModifierLambda()()
}

function nextDrawLambdaOf(coordinator: LayoutNodeCoordinator, canvas: TextCanvas) {
    if (coordinator instanceof LayoutModifierLayoutNodeCoordinator) {
        return () => {
            canvas.save()
            drawCoordinator(coordinator.nextCoordinator, canvas)
            canvas.restore()
        }
    } else {
        return () => {
            const childrenLayoutNodes = reuseChildrenLayoutNodes(coordinator.node.children)
                .sort((a, b) => a.outerCoordinator.z - b.outerCoordinator.z)

            for (const childrenLayoutNode of childrenLayoutNodes) {
                if (childrenLayoutNode.outerCoordinator.isPlaced) {
                    canvas.save()
                    drawCoordinator(childrenLayoutNode.outerCoordinator, canvas)
                    canvas.restore()
                }
            }
        }
    }
}

function reuseChildrenLayoutNodes(
    children: ReadonlyArray<{ key: Key | null, node: Node }>,
): LayoutNode[] {
    const result: LayoutNode[] = []

    const queue = children.map(it => it.node)
    while (queue.length > 0) {
        const node = queue.shift()!

        if (node.hasExtension(MeasurePolicyExtensionKey) || node.hasExtension(SubcomposeNodeExtensionKey)) {
            // Если нода умеет распологать детей - добавить её как дочерний coordinator
            // Если дерево ещё не построено, то [coordinator] достроит его сам.
            const layoutNode = node.getExtension(LayoutNodeExtensionKey)
            if (layoutNode !== undefined)
                result.push(layoutNode)
        } else {
            // Если нода НЕ умеет распологать детей - добавить её детей напрямую
            queue.unshift(...node.children.map(it => it.node))
        }
    }

    return result
}
