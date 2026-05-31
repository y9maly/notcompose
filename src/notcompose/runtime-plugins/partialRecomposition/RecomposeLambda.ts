import {NodeExtensionKey} from "../../runtime/NodeExtensionKey";

export const RecomposeLambdaExtensionKey = new NodeExtensionKey<RecomposeLambda>('RecomposeLambda')

export interface RecomposeLambda {
    (): void
}
