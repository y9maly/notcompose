import {Item} from "./utils";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {ColumnWithConstraints} from "../../notcompose-terminal/highlevel/WithConstraints";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Key} from "../../notcompose/runtime-highlevel/Key";
import {ListItem} from "./ListItem";
import {NameModifier} from "../../notcompose/runtime/modifiers/NameElement";
import {ExampleHeader} from "../common/ExampleHeader";
import {Divider} from "../common/Divider";
import {Constraints} from "../../notcompose-terminal/runtime/layout/Constraints";


export function Content(
    currentDirectoryPath: string,
    items: Item[],
    selectedItemIndex: number,
    statusMessage: string,
    modifier: Modifier = new Modifier(),
) {
    ColumnWithConstraints((constraints: Constraints) => {
        // IntrinsicSize пока нету, поэтому захардкодил девятку. 9 это кол-во строк снизу и сверху этой Column.
        // maxHeight равен нулю если нет ограчений на высоту, поэтому visibleItemsCount равен кол-ву айтемов.
        const visibleItemsCount = constraints.maxHeight === null
            ? items.length
            : Math.max(0, constraints.maxHeight - 9)

        let startId = Math.max(0, selectedItemIndex - Math.floor(visibleItemsCount / 2))
        if (startId + visibleItemsCount > items.length)
            startId = Math.max(0, items.length - visibleItemsCount)

        const visibleItems = items.slice(startId, startId + visibleItemsCount)

        ExampleHeader(' 📂 FileExplorer example ')

        Text(`> ${currentDirectoryPath}`)
        Divider('-')

        if (items.length === 0) {
            Text(`    Directory is empty`)
        }

        visibleItems.forEach((item, i) => {
            const actualIndex = startId + i
            const isSelected = actualIndex === selectedItemIndex

            Key(item.path, () => {
                ListItem(item, isSelected, new Modifier([
                    NameModifier(`List item '${item.filename}'`) // for debug
                ]))
            })
        })

        Divider('-')

        Text(` 💡 ${statusMessage}`)
        Text(` ⌨️  [↑/↓]: Move  |  [Enter]: Open  |  [←/Back]: Up`)
        Divider('=')

        Text(` Total items: ${items.length} (Showing ${startId + 1}-${startId + visibleItems.length})`)
    }, modifier.then(
        NameModifier('ColumnWithConstraints') // for debug
    ))
}
