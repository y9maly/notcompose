import {MeasurePolicyExtensionKey} from "./nodeExtensions/MeasurePolicyNodeExtension.js";
import {currentComposer, Modifier, NameElement, RecomposeLambda, RecomposeLambdaExtensionKey} from "notcompose";
import {MeasurePolicy} from "./MeasurePolicy.js";

export function Layout(content: () => void, measurePolicy: MeasurePolicy, modifier: Modifier = new Modifier()) {
    // if (canSkipComposition(...keys)) {
    //     debug.log(`Skipping ${currentComposer().nextNode()?.findName() ?? '...'}`)
    //     currentComposer().skipComposition()
    //     return
    // } else {
    //     debug.log(`Can't skip ${currentComposer().nextNode()?.findName() ?? '...'}`)
    // }
    currentComposer().startNode(modifier.then(new NameElement('Layout')))
    currentComposer().applyExtension(MeasurePolicyExtensionKey, measurePolicy)
    currentComposer().applyExtension(RecomposeLambdaExtensionKey, content satisfies RecomposeLambda)
    currentComposer().startComposingNode()
    content()
    currentComposer().endComposingNode()
    currentComposer().endNode()
}
