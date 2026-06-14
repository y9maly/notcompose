import {MeasureResult} from "./Measurable.js";
import {Constraints} from "./Constraints.js";
import {debug} from "notcompose";
import {LayoutNode} from "./layoutNode/LayoutNode.js";

export interface LayoutProcessorPlugin {
    beforeMeasure(layoutNode: LayoutNode, constraints: Constraints):
        | void
        | MeasureResult

    afterMeasure(layoutNode: LayoutNode, constraints: Constraints, measureResult: MeasureResult): MeasureResult
}













type DebugMeasureLine = {
    constraints: Constraints
    result?: MeasureResult
}

type DebugMeasureNode = {
    layoutNode: LayoutNode
    name: string
    lines: DebugMeasureLine[]
    children: DebugMeasureNode[]
}

type StackEntry = {
    node: DebugMeasureNode
    line: DebugMeasureLine
    isCoordinatorLine: boolean
}

export class LayoutProcessorPluginDebug implements LayoutProcessorPlugin {
    private stack: StackEntry[] = []
    private roots: DebugMeasureNode[] = []

    beforeMeasure(
        layoutNode: LayoutNode,
        constraints: Constraints,
    ): void | MeasureResult {
        const current = this.stack[this.stack.length - 1]

        if (current?.node.layoutNode === layoutNode) {
            const line: DebugMeasureLine = {
                constraints,
            }

            current.node.lines.push(line)

            this.stack.push({
                node: current.node,
                line,
                isCoordinatorLine: true,
            })

            return
        }

        const node: DebugMeasureNode = {
            layoutNode,
            name: this.layoutNodeName(layoutNode),
            lines: [
                {
                    constraints,
                },
            ],
            children: [],
        }

        const parent = current?.node

        if (parent) {
            parent.children.push(node)
        } else {
            this.roots.push(node)
        }

        this.stack.push({
            node,
            line: node.lines[0],
            isCoordinatorLine: false,
        })
    }

    afterMeasure(
        layoutNode: LayoutNode,
        constraints: Constraints,
        measureResult: MeasureResult,
    ): MeasureResult {
        const entry = this.stack.pop()

        if (!entry) {
            debug.log(
                `⚠ afterMeasure without beforeMeasure: ${this.layoutNodeName(layoutNode)}`,
            )
            return measureResult
        }

        entry.line.result = measureResult

        if (entry.node.layoutNode !== layoutNode) {
            debug.log(
                [
                    `⚠ measure stack mismatch`,
                    `expected: ${entry.node.name}`,
                    `actual:   ${this.layoutNodeName(layoutNode)}`,
                ].join('\n'),
            )
        }

        if (this.stack.length === 0) {
            for (const root of this.roots) {
                debug.log(this.renderTree(root))
            }

            this.roots = []
        }

        return measureResult
    }

    private renderTree(root: DebugMeasureNode): string {
        return this.renderNode(root, 0).join('\n')
    }

    private renderNode(
        node: DebugMeasureNode,
        depth: number,
    ): string[] {
        const lines: string[] = []

        const prefix = this.depthPrefix(depth)
        const name = node.name

        node.lines.forEach((line, index) => {
            const result = line.result
                ? this.formatSize(line.result)
                : 'not measured'

            if (index === 0) {
                lines.push(
                    `${prefix}${name} → ${result} (${this.formatConstraints(line.constraints)})`,
                )
            } else {
                const spacer = ' '.repeat(name.length)

                lines.push(
                    `${prefix}${spacer} → ${result} (${this.formatConstraints(line.constraints)})`,
                )
            }
        })

        for (const child of node.children) {
            lines.push(...this.renderNode(child, depth + 1))
        }

        return lines
    }

    private depthPrefix(depth: number): string {
        if (depth === 0) {
            return ''
        }

        return `${'| '.repeat(depth)}`
    }

    private layoutNodeName(layoutNode: LayoutNode): string {
        return layoutNode.node.findName() ?? 'unnamed'
    }

    private formatSize(result: MeasureResult): string {
        return `${result.width}w × ${result.height}h`
    }

    private formatConstraints(constraints: Constraints): string {
        return [
            `${constraints.minWidth}..${constraints.maxWidth}w`,
            `${constraints.minHeight}..${constraints.maxHeight}h`,
        ].join(' × ')
    }
}