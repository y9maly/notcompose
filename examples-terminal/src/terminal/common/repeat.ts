
export function repeat(times: number, block: (iteration: number) => void) {
    for (let i = 0; i < times; i++) {
        block(i)
    }
}
