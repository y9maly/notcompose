import {Item} from "./utils";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {DisposableEffect} from "../../notcompose/runtime-highlevel/DisposableEffect";
import {Row} from "../../notcompose-terminal/highlevel/Row";
import {Text} from "../../notcompose-terminal/highlevel/Text";


export function ListItem(
    item: Item,
    isSelected: boolean,
    modifier: Modifier = new Modifier(),
) {
    const cursor = rememberState<string>(() => '  ')
    let icon = item.filename === '..' ? `🔙` : (item.isDirectory ? `📁` : `📄`)

    DisposableEffect([isSelected], () => {
        if (!isSelected) {
            cursor.value = '  '
            return
        }

        let counter = 0
        cursor.value = '▶ '
        const interval = setInterval(() => {
            if (counter++ % 2 === 0) {
                cursor.value = ` ▶`
            } else {
                cursor.value = `▶ `
            }
        }, 750)

        return () => {
            clearInterval(interval)
        }
    })

    Row(() => {
        Text(` ${cursor.value} `);
        Text(`${icon} `);

        if (isSelected) {
            Text(`[ ${item.filename} ]`);
        } else {
            Text(`  ${item.filename}`);
        }
    }, modifier)
}
