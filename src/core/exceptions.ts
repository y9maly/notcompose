export function error(message: unknown): never {
    throw new Error(message?.toString())
}
