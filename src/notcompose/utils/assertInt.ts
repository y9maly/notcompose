export function assertInt(...values: number[]): void
export function assertInt(values: Iterable<number>): void
export function assertInt(...values: number[] | [Iterable<number>]): void {
    let numbers = values.length === 1 && typeof values[0] === 'object'
        ? values[0]
        : values

    let index = 0
    for (const number of numbers) {
        if (!Number.isSafeInteger(number))
            throw new Error(`Value at index ${index} is not a safe integer: ${number}`)
        index++
    }
}
