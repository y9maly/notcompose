export interface IntrinsicMeasurable {
    minIntrinsicWidth(height: number | null): number
    maxIntrinsicWidth(height: number | null): number
    minIntrinsicHeight(width: number | null): number
    maxIntrinsicHeight(width: number | null): number
}
