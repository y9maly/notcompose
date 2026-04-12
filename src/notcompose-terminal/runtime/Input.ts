import {currentComposer} from "../../notcompose/runtime/currentComposer";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {InputModifier} from "./modifiers/InputModifier";


export function input(read: (str: string, key: any) => boolean) {
    currentComposer().startNode(new Modifier([InputModifier(read)]))
    currentComposer().endNode()
}
