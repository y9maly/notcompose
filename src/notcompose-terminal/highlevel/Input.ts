import {currentComposer, Modifier} from "notcompose";
import {InputModifier} from "../runtime/modifiers/InputModifier.js";

export function input(read: (str: string, key: any) => boolean) {
    currentComposer().startNode(new Modifier([InputModifier(read)]))
    currentComposer().endNode()
}
