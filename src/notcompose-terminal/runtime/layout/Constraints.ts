import {assertInt} from "../../../notcompose/utils/assertInt";
import {Size} from "../ui/Size";


export class Constraints {
    minWidth: number         // 0..
    maxWidth: number | null  // 0..inf (null is infinity)
    minHeight: number        // 0..
    maxHeight: number | null // 0..inf (null is infinity)

    constructor(
        minWidth: number,
        maxWidth: number | null,
        minHeight: number,
        maxHeight: number | null
    )

    constructor(values?: {
        minWidth?: number,        // 0 by default
        maxWidth?: number | null, // null by default
        minHeight?: number,       // 0 by default
        maxHeight?: number | null // null by default
    })

    constructor(
        a: number | undefined | {
            minWidth?: number,        // 0 by default
            maxWidth?: number | null, // null by default
            minHeight?: number,       // 0 by default
            maxHeight?: number | null // null by default
        },
        b?: number | null,
        c?: number,
        d?: number | null,
    ) {
        if (a === undefined || typeof a === 'object') {
            this.minWidth = a?.minWidth ?? 0
            this.maxWidth = a?.maxWidth ?? null
            this.minHeight = a?.minHeight ?? 0
            this.maxHeight = a?.maxHeight ?? null
        } else {
            this.minWidth = a!
            this.maxWidth = b as number | null
            this.minHeight = c!
            this.maxHeight = d as number | null
        }

        assertInt(this.minWidth, this.minHeight)
        if (this.maxWidth !== null)
            assertInt(this.maxWidth)
        if (this.maxHeight !== null)
            assertInt(this.maxHeight)

        if (this.maxWidth !== null && this.minWidth > this.maxWidth)
            throw new Error('minWidth should be less than maxWidth')
        if (this.maxHeight !== null && this.minHeight > this.maxHeight)
            throw new Error('minHeight should be less than maxHeight')
    }

    get isZero() {
        return this.maxWidth === 0 || this.maxHeight === 0
    }

    get hasInfinityWidth() {
        return this.maxWidth === null
    }

    get hasInfinityHeight() {
        return this.maxHeight === null
    }

    get hasBoundedWidth() {
        return this.maxWidth !== null
    }

    get hasBoundedHeight() {
        return this.maxHeight !== null
    }

    get hasFixedWidth() {
        return this.minWidth === this.maxWidth
    }

    get hasFixedHeight() {
        return this.minHeight === this.maxHeight
    }

    get hasFixedSize() {
        return this.hasFixedWidth && this.hasFixedHeight
    }

    constrain(other: Constraints): Constraints
    constrain(other: Size): Size
    constrain(other: Constraints | Size): Constraints | Size {
        if (other instanceof Size)
            return new Size(
                this.maxWidth === null
                    ? Math.max(this.minWidth, other.width)
                    : Math.max(this.minWidth, Math.min(this.maxWidth, other.width)),
                this.maxHeight === null
                    ? Math.max(this.minHeight, other.height)
                    : Math.max(this.minHeight, Math.min(this.maxHeight, other.height)),
            )

        const minWidth = this.maxWidth === null
            ? Math.max(this.minWidth, other.minWidth)
            : Math.max(this.minWidth, Math.min(this.maxWidth, other.minWidth))
        const maxWidth = this.maxWidth === null
            ? (other.maxWidth === null ? null : Math.max(this.minWidth, other.maxWidth))
            : Math.max(this.minWidth, Math.min(this.maxWidth, other.maxWidth ?? this.maxWidth))
        const minHeight = this.maxHeight === null
            ? Math.max(this.minHeight, other.minHeight)
            : Math.max(this.minHeight, Math.min(this.maxHeight, other.minHeight))
        const maxHeight = this.maxHeight === null
            ? (other.maxHeight === null ? null : Math.max(this.minHeight, other.maxHeight))
            : Math.max(this.minHeight, Math.min(this.maxHeight, other.maxHeight ?? this.maxHeight))
        return new Constraints(minWidth, maxWidth, minHeight, maxHeight)
    }

    isSatisfiedBy(size: Size): boolean {
        if (size.width < this.minWidth || (this.maxWidth !== null && size.width > this.maxWidth))
            return false
        if (size.height < this.minHeight || (this.maxHeight !== null && size.height > this.maxHeight))
            return false
        return true
    }

    constrainWidth(value: number): number {
        if (value < this.minWidth) value = this.minWidth
        else if (this.maxWidth !== null && value > this.maxWidth) value = this.maxWidth
        return value
    }

    constrainHeight(value: number): number {
        if (value < this.minHeight) value = this.minHeight
        else if (this.maxHeight !== null && value > this.maxHeight) value = this.maxHeight
        return value
    }

    minusMaxWidth(count: number): Constraints {
        if (this.maxWidth === null)
            return this
        const maxWidth = Math.max(0, this.maxWidth - count)
        return this.copy({
            minWidth: Math.min(maxWidth, this.minWidth),
            maxWidth: maxWidth,
        })
    }

    minusMaxHeight(count: number): Constraints {
        if (this.maxHeight === null)
            return this
        const maxHeight = Math.max(0, this.maxHeight - count)
        return this.copy({
            minHeight: Math.min(maxHeight, this.minHeight),
            maxHeight: maxHeight,
        })
    }

    copyMaxDimensions() {
        return new Constraints(0, this.maxWidth, 0, this.maxHeight)
    }

    offset(horizontal: number, vertical: number): Constraints {
        return new Constraints(
            Math.max(0, this.minWidth + horizontal),
            this.addMaxWithMinimum(this.maxWidth, horizontal),
            Math.max(0, this.minHeight + vertical),
            this.addMaxWithMinimum(this.maxHeight, vertical),
        )
    }

    copy(params: {
        minWidth?: number,
        maxWidth?: number | null,
        minHeight?: number,
        maxHeight?: number | null
    }) {
        return new Constraints(
            params.minWidth ?? this.minWidth,
            params.maxWidth !== undefined ? params.maxWidth : this.maxWidth,
            params.minHeight ?? this.minHeight,
            params.maxHeight !== undefined ? params.maxHeight : this.maxHeight,
        )
    }

    private addMaxWithMinimum(max: number | null, value: number): number | null {
        if (max === null) return max
        return Math.max(0, max + value)
    }
}
