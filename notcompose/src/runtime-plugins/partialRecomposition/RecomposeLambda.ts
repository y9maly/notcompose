import { NodeExtensionKey } from '../../runtime/NodeExtensionKey.js'

export const RecomposeLambdaExtensionKey = new NodeExtensionKey<RecomposeLambda>('RecomposeLambda')

export interface RecomposeLambda {
    (): void
}
