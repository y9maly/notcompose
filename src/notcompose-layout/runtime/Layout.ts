import { MeasurePolicyExtensionKey } from './nodeExtensions/MeasurePolicyNodeExtension.js'
import { currentComposer, Modifier, NameModifier, RecomposeLambda, RecomposeLambdaExtensionKey } from 'notcompose'
import { MeasurePolicy } from './MeasurePolicy.js'

export function Layout(content: () => void, measurePolicy: MeasurePolicy, modifier: Modifier = Modifier) {
    // if (canSkipComposition(...keys)) {
    //     debug.log(`Skipping ${currentComposer().nextNode()?.findName() ?? '...'}`)
    //     currentComposer().skipComposition()
    //     return
    // } else {
    //     debug.log(`Can't skip ${currentComposer().nextNode()?.findName() ?? '...'}`)
    // }
    currentComposer().startNode(modifier.then(NameModifier('Layout')))
    currentComposer().applyExtension(MeasurePolicyExtensionKey, measurePolicy)
    currentComposer().applyExtension(RecomposeLambdaExtensionKey, content satisfies RecomposeLambda)
    currentComposer().startComposingNode()
    content()
    currentComposer().endComposingNode()
    currentComposer().endNode()
}
