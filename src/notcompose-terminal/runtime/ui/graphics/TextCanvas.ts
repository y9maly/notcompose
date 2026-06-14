import {AnnotatedString} from "../AnnotatedString";
import {Rect, RectLike} from "../../../../notcompose-layout/runtime/core/Rect";
import {TransformationMatrix} from "./TransformationMatrix";
import {Float} from "../../../../core/types";
import {Size} from "../../../../notcompose-layout/runtime/core/Size";

export interface TextCanvas {
    get width(): number
    get height(): number
    get size(): Size

    save(): void
    restore(): void

    // Transform

    concat(matrix: TransformationMatrix): void

    translate(dx: Float, dy: Float): void

    scale(scale: Float): void
    scale(scaleX: Float, scaleY: Float): void
    // todo
    // scale(scaleX: Float, scaleY: Float, pivot: Offset): void {
    //     this.translate(pivot.x, pivot.y)
    //     this.scale(scaleX, scaleY)
    //     this.translate(-pivot.x, -pivot.y)
    // }

    skew(sx: Float, sy: Float): void
    skewRad(sxRad: Float, syRad: Float): void

    rotate(degrees: Float): void
    rotateRad(rad: Float): void
    // todo
    // rotate(degrees: Float, pivot: Offset): void {
    //     this.translate(pivot.x, pivot.y)
    //     this.rotate(degrees)
    //     this.translate(-pivot.x, -pivot.y)
    // }

    // Clip

    clipRect(left: Float, top: Float, right: Float, bottom: Float): void
    clipRect(rect: RectLike): void

    clipOutRect(left: Float, top: Float, right: Float, bottom: Float): void
    clipOutRect(rect: RectLike): void

    // Drawing

    drawText(x: Float, y: Float, input: string | AnnotatedString): void
}
