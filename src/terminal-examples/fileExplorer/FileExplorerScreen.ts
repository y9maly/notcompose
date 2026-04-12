import path from "path";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {input} from "../../notcompose-terminal/runtime/Input";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {getDirectoryContents} from "./utils";
import {Content} from "./Content";


export function FileExplorerScreen(
    modifier: Modifier = new Modifier(),
) {
    const currentDirectoryPath = rememberState(() => process.cwd())
    const items = rememberState(() => getDirectoryContents(process.cwd()))
    const selectedIndex = rememberState(() => 0)
    const statusMessage = rememberState(() => 'Use Arrows to navigate, Enter to open.')

    input((str, key) => {
        if (!key) return true

        const maxIndex = items.value.length - 1

        if (key.name === 'up') {
            if (selectedIndex.value > 0) {
                selectedIndex.value--
                statusMessage.value = ''
            }
        } else if (key.name === 'down') {
            if (selectedIndex.value < maxIndex) {
                selectedIndex.value++
                statusMessage.value = ''
            }
        } else if (key.name === 'return' || key.name === 'enter') {
            const selectedItem = items.value[selectedIndex.value]
            if (selectedItem) {
                if (selectedItem.isDirectory) {
                    try {
                        const newItems = getDirectoryContents(selectedItem.path)
                        currentDirectoryPath.value = selectedItem.path
                        items.value = newItems
                        selectedIndex.value = 0
                        statusMessage.value = `Opened: ${selectedItem.filename}`
                    } catch (e) {
                        statusMessage.value = `Cannot access this directory!`
                    }
                } else {
                    statusMessage.value = `File selected: ${selectedItem.filename}`
                }
            }
        } else if (key.name === 'left' || key.name === 'backspace') {
            const parentPath = path.resolve(currentDirectoryPath.value, '..')
            if (currentDirectoryPath.value !== parentPath) {
                currentDirectoryPath.value = parentPath
                items.value = getDirectoryContents(parentPath)
                selectedIndex.value = 0
                statusMessage.value = ''
            }
        }

        return true
    })

    Content(
        currentDirectoryPath.value,
        items.value,
        selectedIndex.value,
        statusMessage.value,
        modifier,
    )
}
