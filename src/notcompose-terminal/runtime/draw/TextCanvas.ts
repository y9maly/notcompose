import {AnnotatedString} from "./AnnotatedString";


export interface TextCanvas {
    readonly width: number
    readonly height: number

    // todo временно
    resetTranslate(): void
    translate(x: number, y: number): void
    drawText(x: number, y: number, string: string | AnnotatedString): void
}
