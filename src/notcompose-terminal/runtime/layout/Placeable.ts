export interface Placeable {
    width: number
    height: number

    place(x: number, y: number): void
}
