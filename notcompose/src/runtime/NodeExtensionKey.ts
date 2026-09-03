
export interface NodeExtensionKey<T> {
    symbol: symbol
}

interface NodeExtensionKeyConstructor {
    new <T>(description?: string): NodeExtensionKey<T>
}

export const NodeExtensionKey: NodeExtensionKeyConstructor = function (description?: string) {
    return { symbol: Symbol(`NodeExtensionKey(${description ?? ''})`) }
} as unknown as NodeExtensionKeyConstructor
