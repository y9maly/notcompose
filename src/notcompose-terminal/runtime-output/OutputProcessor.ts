import {Node} from "../../notcompose/runtime/Node";
import {RawTextModifier} from "../runtime/modifiers/RawTextModifier";
import {LayoutModifierNodeCoordinator} from "../runtime-layout/LayoutModifierNodeCoordinator";
import {NodeCoordinatorExtensionKey} from "../runtime/nodeExtensions/NodeCoordinatorExtension";
import {NodeCoordinator} from "../runtime-layout/NodeCoordinator";
import {TextCanvas} from "../runtime/draw/TextCanvas";
import {TextBuffer} from "../runtime/draw/TextBuffer";


export interface OutputProcessor {
    doFrame(node: Node, width: number, height: number): void
}

export class StringOutputProcessor implements OutputProcessor {
    constructor(
        private onFrame: (string: string) => void
    ) {}

    doFrame(node: Node, width: number, height: number): void {
        const buffer = new TextBuffer([], width, height)
        materialize(node, buffer)

        const rows = buffer.buffer
            .map(row => row.join('').trimEnd())
        for (let i = rows.length - 1; i >= 0; i--) {
            if (rows[i].trim() === '') rows.splice(i, 1)
            else break
        }

        this.onFrame(rows.join('\n'))
    }
}

export class ConsoleOutputProcessor implements OutputProcessor {
    constructor(
        private stream: NodeJS.WritableStream,
        private options?: {
            before?: () => void,
            after?: () => void,
        }
    ) {}

    private stringProcessor = new StringOutputProcessor((string) => {
        this.options?.before?.()
        this.stream.write(string)
        this.options?.after?.()
    })

    doFrame(node: Node, width: number, height: number): void {
        this.stringProcessor.doFrame(node, width, height)
    }
}

function materialize(node: Node, canvas: TextCanvas) {
    const nodeQueue = [{ node, offsetX: 0, offsetY: 0 }]

    while (nodeQueue.length > 0) {
        const { node, offsetX, offsetY } = nodeQueue.shift()!

        const outerCoordinator = node.extensions.get(NodeCoordinatorExtensionKey) as NodeCoordinator | undefined

        if (!outerCoordinator) {
            nodeQueue.push(...node.children.map(it => ({
                node: it.node,
                offsetX,
                offsetY
            })))
            continue
        }

        let cx = offsetX
        let cy = offsetY

        let currentCoordinator = outerCoordinator

        while (true) {
            if (currentCoordinator.placed) {
                cx += currentCoordinator.x
                cy += currentCoordinator.y

                for (const element of currentCoordinator.elements) {
                    const text = RawTextModifier.of(element)
                    if (text) {
                        canvas.resetTranslate()
                        canvas.translate(cx, cy)
                        text.rawText(currentCoordinator.width, currentCoordinator.height, canvas)
                    }
                }
            }

            if (currentCoordinator instanceof LayoutModifierNodeCoordinator) {
                currentCoordinator = currentCoordinator.nextCoordinator
            } else {
                break
            }
        }

        nodeQueue.push(...node.children.map(it => ({
            node: it.node,
            offsetX: cx,
            offsetY: cy
        })))
    }

    return
}
