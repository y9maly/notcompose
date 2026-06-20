import {currentComposer, Modifier} from "notcompose";
import {handleInput} from "../runtime/modifiers/InputHandler.js";

export function input(read: (str: string, key: any) => boolean) {
    currentComposer().startNode(Modifier.then(handleInput(read)))
    currentComposer().endNode()
}
