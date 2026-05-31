import {LayoutDirection} from "./LayoutDirection";
import {Size} from "./Size";
import {Offset} from "./Offset";

export interface Alignment {
    /* align */(size: Size, space: Size, layoutDirection?: LayoutDirection): Offset
}

export interface HorizontalAlignment {
    /* align */(size: number, space: number, layoutDirection?: LayoutDirection): number
}

export interface VerticalAlignment {
    /* align */(size: number, space: number): number
}

export function Alignment(
    align: (size: Size, space: Size, layoutDirection?: LayoutDirection) => Offset
): Alignment {
    return align
}

export function HorizontalAlignment(
    align: (size: number, space: number, layoutDirection?: LayoutDirection) => number
): HorizontalAlignment {
    return align
}

export function VerticalAlignment(
    align: (size: number, space: number) => number
): VerticalAlignment {
    return align
}

// 2D

Alignment.TopStart = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? space.width - size.width
            : 0,
        0,
    )
})

Alignment.TopCenter = Alignment((size, space) => {
    return new Offset(
        Math.round(space.width / 2 - size.width / 2),
        0,
    )
})

Alignment.TopCenterL = Alignment((size, space) => {
    return new Offset(
        Math.floor(space.width / 2 - size.width / 2),
        0,
    )
})

Alignment.TopCenterR = Alignment((size, space) => {
    return new Offset(
        Math.ceil(space.width / 2 - size.width / 2),
        0,
    )
})

Alignment.TopEnd = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? 0
            : space.width - size.width,
        0,
    )
})

Alignment.CenterStart = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? space.width - size.width
            : 0,
        Math.round(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterStartT = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? space.width - size.width
            : 0,
        Math.floor(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterStartB = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? space.width - size.width
            : 0,
        Math.ceil(space.height / 2 - size.height / 2),
    )
})

Alignment.Center = Alignment((size, space) => {
    return new Offset(
        Math.round(space.width / 2 - size.width / 2),
        Math.round(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterL = Alignment((size, space) => {
    return new Offset(
        Math.floor(space.width / 2 - size.width / 2),
        Math.round(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterR = Alignment((size, space) => {
    return new Offset(
        Math.ceil(space.width / 2 - size.width / 2),
        Math.round(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterT = Alignment((size, space) => {
    return new Offset(
        Math.round(space.width / 2 - size.width / 2),
        Math.floor(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterB = Alignment((size, space) => {
    return new Offset(
        Math.round(space.width / 2 - size.width / 2),
        Math.ceil(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterTL = Alignment((size, space) => {
    return new Offset(
        Math.floor(space.width / 2 - size.width / 2),
        Math.floor(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterTR = Alignment((size, space) => {
    return new Offset(
        Math.ceil(space.width / 2 - size.width / 2),
        Math.floor(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterBL = Alignment((size, space) => {
    return new Offset(
        Math.floor(space.width / 2 - size.width / 2),
        Math.ceil(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterBR = Alignment((size, space) => {
    return new Offset(
        Math.ceil(space.width / 2 - size.width / 2),
        Math.ceil(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterEnd = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? 0
            : space.width - size.width,
        Math.round(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterEndT = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? 0
            : space.width - size.width,
        Math.floor(space.height / 2 - size.height / 2),
    )
})

Alignment.CenterEndB = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? 0
            : space.width - size.width,
        Math.ceil(space.height / 2 - size.height / 2),
    )
})

Alignment.BottomStart = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? space.width - size.width
            : 0,
        space.height - size.height,
    )
})

Alignment.BottomCenter = Alignment((size, space) => {
    return new Offset(
        Math.round(space.width / 2 - size.width / 2),
        space.height - size.height,
    )
})

Alignment.BottomCenterL = Alignment((size, space) => {
    return new Offset(
        Math.floor(space.width / 2 - size.width / 2),
        space.height - size.height,
    )
})

Alignment.BottomCenterR = Alignment((size, space) => {
    return new Offset(
        Math.ceil(space.width / 2 - size.width / 2),
        space.height - size.height,
    )
})

Alignment.BottomEnd = Alignment((size, space, layoutDirection) => {
    return new Offset(
        layoutDirection === LayoutDirection.RTL
            ? 0
            : space.width - size.width,
        space.height - size.height,
    )
})

// Vertical

Alignment.Top = VerticalAlignment(() => {
    return 0
})

Alignment.CenterVertically = VerticalAlignment((size, space) => {
    return Math.round(space / 2 - size / 2)
})

Alignment.CenterVerticallyL = VerticalAlignment((size, space) => {
    return Math.floor(space / 2 - size / 2)
})

Alignment.CenterVerticallyR = VerticalAlignment((size, space) => {
    return Math.ceil(space / 2 - size / 2)
})

Alignment.Bottom = VerticalAlignment((size, space) => {
    return space - size
})

// Horizontal

Alignment.Start = HorizontalAlignment((size, space, layoutDirection) => {
    if (layoutDirection === LayoutDirection.RTL) return space - size
    return 0
})

Alignment.CenterHorizontally = Alignment.CenterVertically as HorizontalAlignment
Alignment.CenterHorizontallyL = Alignment.CenterVerticallyL as HorizontalAlignment
Alignment.CenterHorizontallyR = Alignment.CenterVerticallyR as HorizontalAlignment

Alignment.End = HorizontalAlignment((size, space, layoutDirection) => {
    if (layoutDirection === LayoutDirection.RTL) return 0
    return space - size
})
