export type Int = number
export type UInt = number
export type Float = number
export type Char = string & { length: 1 }

export function Char(string: string): Char {
    assertChar(string)
    return string as Char
}

// Asserts


export function assertInt(...values: number[]): void
export function assertInt(values: Iterable<number>): void
export function assertInt(...values: number[] | [Iterable<number>]): void {
    let numbers = values.length === 1 && typeof values[0] === 'object'
        ? values[0] as Iterable<number>
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
    let numbers = values.length === 1 && typeof values[0] === 'object'
        ? values[0] as Iterable<number>
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
