export interface Placeable {
    width: number
    height: number

    /**
     * [z] is default to 0
     */
    place(x: number, y: number, z?: number): void
}
