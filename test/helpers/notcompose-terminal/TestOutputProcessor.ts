import { annotated, AnnotatedString, OutputProcessor, RawOutputProcessor } from 'notcompose/terminal'
import { Node } from 'notcompose'
import { TestOutput } from './TestOutput.js'
import { BehaviorSubject } from 'rxjs'

export class TestOutputProcessor implements OutputProcessor, TestOutput {
    lastOutput?: AnnotatedString[]
    _viewportWidth: number = 100
    _viewportHeight: number = 100
    lastOutputWidth: number = 0
    lastOutputHeight: number = 0

    get viewportWidth() { return this._viewportWidth }
    get viewportHeight() { return this._viewportHeight }

    set viewportWidth(value: number) {
        this._viewportWidth = value
        this.viewportSize.next([this.viewportWidth, this.viewportHeight])
    }

    set viewportHeight(value: number) {
        this._viewportHeight = value
        this.viewportSize.next([this.viewportWidth, this.viewportHeight])
    }

    public viewportSize = new BehaviorSubject<[number, number]>([this.viewportWidth, this.viewportHeight])
    private raw = new RawOutputProcessor(this.viewportSize, (rows, width, height) => {
        const annotatedRows: AnnotatedString[] = []

        rows.forEach((row) => {
            let annotatedRow = annotated``

            row.cells.forEach((cell) => {
                annotatedRow = annotatedRow.plus(annotated(cell.char, ...cell.spans))
            })

            annotatedRows.push(annotatedRow)
        })

        this.lastOutput = annotatedRows
        this.lastOutputWidth = width
        this.lastOutputHeight = height
    })

    doFrame(node: Node, width: number, height: number): void {
        this.raw.doFrame(node, width, height)
    }
}
