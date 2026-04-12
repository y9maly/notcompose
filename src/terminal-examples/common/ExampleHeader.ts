import {Box} from "../../notcompose-terminal/highlevel/Box";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Alignment} from "../../notcompose-terminal/runtime/ui/Alignment";
import {Divider} from "./Divider";


export function ExampleHeader(text: string) {
    Box(() => {
        Divider()
        Text(text)
    }, new Modifier(), {
        alignment: Alignment.Center
    })
}
