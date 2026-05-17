import {Float} from "../../../core/types";

export interface Rect {
    left: Float
    top: Float
    right: Float
    bottom: Float
}

export interface RectConstructor {
    new (left: Float, top: Float, right: Float, bottom: Float): Rect
}

export const Rect: RectConstructor = function(this: Rect, left: number, top: number, right: number, bottom: number): Rect {
    return { left, top, right, bottom }
} as unknown as RectConstructor
