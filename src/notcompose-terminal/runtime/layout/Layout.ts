import {MeasurePolicy} from "./measure.js";
import {MeasurePolicyNodeExtensionKey} from "../nodeExtensions/MeasurePolicyNodeExtension.js";
import {Modifier} from "../../../notcompose/runtime/Modifier";
import {currentComposer} from "../../../notcompose/runtime/currentComposer";
import {
    RecomposeLambda,
    RecomposeLambdaExtensionKey
} from "../../../notcompose/runtime-plugins/partialRecomposition/RecomposeLambda";


export function Layout(content: () => void, measurePolicy: MeasurePolicy, modifier: Modifier = new Modifier()) {
    // if (canSkipComposition(...keys)) {
    //     debug.log(`Skipping ${currentComposer().nextNode()?.findName() ?? '...'}`)
    //     currentComposer().skipComposition()
    //     return
    // } else {
    //     debug.log(`Can't skip ${currentComposer().nextNode()?.findName() ?? '...'}`)
    // }
    currentComposer().startNode(modifier)
    currentComposer().applyExtension(MeasurePolicyNodeExtensionKey, measurePolicy)
    currentComposer().applyExtension(RecomposeLambdaExtensionKey, content satisfies RecomposeLambda)
    currentComposer().startComposingNode()
    content()
    currentComposer().endComposingNode()
    currentComposer().endNode()
}
