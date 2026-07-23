export type Int = number
export type UInt = number
export type Float = number
export type Char = string & { length: 1 }

export function Char(string: string): Char {
    assertChar(string)
    return string as Char
}

// Asserts

type IsAny<T> = 0 extends (1 & T) ? true : false
type OnlyAny<T> = IsAny<T> extends true ? T : never
export function assertAny<T>(value: OnlyAny<T>): any {
    return value
}

export function assertType<T = never>(value: NoInfer<T>): T {
    return value
}


export function assertInt(...values: number[]): void
export function assertInt(values: Iterable<number>): void
export function assertInt(...values: number[] | [Iterable<number>]): void {
    const numbers = values.length === 1 && typeof values[0] === 'object'
        ? values[0]
        : values as number[]

    let index = 0
    for (const number of numbers) {
        if (!Number.isSafeInteger(number))
            throw new Error(`Value at index ${index} is not a safe integer: ${number}`)
        index++
    }
}

export function assertUInt(...values: number[]): void
export function assertUInt(values: Iterable<number>): void
export function assertUInt(...values: number[] | [Iterable<number>]): void {
    const numbers = values.length === 1 && typeof values[0] === 'object'
        ? values[0]
        : values as number[]

    let index = 0
    for (const number of numbers) {
        if (!Number.isSafeInteger(number))
            throw new Error(`Value at index ${index} is not a safe integer: ${number}`)
        if (number < 0)
            throw new Error(`Value at index ${index} is not an unsigned integer: ${number}`)
        index++
    }
}

export function assertChar(string: string): void {
    if (string.length !== 1)
        throw new RangeError(`Char length should be 1. String "${string}" cannot be a char.`)
}
