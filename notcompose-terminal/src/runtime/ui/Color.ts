import { assertUInt } from '@notcompose/core'

export class Color {
    public readonly red: number
    public readonly green: number
    public readonly blue: number
    public readonly alpha: number

    constructor(argb: number)
    constructor(red: number, green: number, blue: number, alpha?: number)
    constructor(
        a: number,
        b?: number,
        c?: number,
        d: number = 1,
    ) {
        if (b === undefined) {
            this.alpha = ((a & 0xff000000) >>> 24) / 255
            this.red = (a & 0x00ff0000) >>> 16
            this.green = (a & 0x0000ff00) >>> 8
            this.blue = (a & 0x000000ff)
        } else {
            this.alpha = d
            this.red = a
            this.green = b!
            this.blue = c!
        }

        assertUInt(this.red, this.green, this.blue, this.alpha)
        if (this.red < 0 && this.red > 255)
            throw new Error(`red is not in 0..255 range: ${this.red}`)
        if (this.green < 0 && this.green > 255)
            throw new Error(`green is not in 0..255 range: ${this.green}`)
        if (this.blue < 0 && this.blue > 255)
            throw new Error(`blue is not in 0..255 range: ${this.blue}`)
        if (this.alpha < 0 && this.alpha > 1)
            throw new Error(`alpha is not in 0..1 range: ${this.alpha}`)
    }

    static Black = new Color(0xFF000000)
    static DarkGray = new Color(0xFF444444)
    static Gray = new Color(0xFF888888)
    static LightGray = new Color(0xFFCCCCCC)
    static White = new Color(0xFFFFFFFF)
    static Red = new Color(0xFFFF0000)
    static Green = new Color(0xFF00FF00)
    static Blue = new Color(0xFF0000FF)
    static Yellow = new Color(0xFFFFFF00)
    static Cyan = new Color(0xFF00FFFF)
    static Magenta = new Color(0xFFFF00FF)
    static DarkCyan = new Color(0xFF008B8B)
    static Transparent = new Color(0x00000000)

    equals(other: Color): boolean {
        return this.red === other.red
            && this.green === other.green
            && this.blue === other.blue
            && this.alpha === other.alpha
    }
}
