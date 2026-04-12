import {Modifier} from "../../../notcompose/runtime/Modifier";
import {MainViewModel} from "./MainViewModel";
import {BorderedTitledBox} from "../components/BorderedTitledBox";
import {Column} from "../../../notcompose-terminal/highlevel/Column";
import {SolidPlot} from "../components/plot/SolidPlot";
import {
    FillMaxHeightModifier,
    FillMaxSizeModifier,
    FillMaxWidthModifier
} from "../../../notcompose-terminal/runtime/modifiers/FillModifier";
import {Text} from "../../../notcompose-terminal/highlevel/Text";
import {OffsetModifier} from "../../../notcompose-terminal/runtime/modifiers/OffsetModifier";
import {Row} from "../../../notcompose-terminal/highlevel/Row";
import {Box} from "../../../notcompose-terminal/highlevel/Box";
import {Divider} from "../../common/Divider";
import {ConstraintsModifiers} from "../../../notcompose-terminal/runtime/modifiers/ConstraintsModifier";
import os from "os";
import {input} from "../../../notcompose-terminal/runtime/Input";


export function MainScreen(
    viewModel: MainViewModel,
    modifier: Modifier = new Modifier(),
) {
    input((str) => {
        if (str === '0') {
            viewModel.incrementNetworkRefreshRate()
            return true
        } else if (str === '9') {
            viewModel.decrementNetworkRefreshRate()
            return true
        } else if (str === '+' || str === '=') {
            viewModel.incrementRefreshRate()
            return true
        } else if (str === '-') {
            viewModel.decrementRefreshRate()
            return true
        }

        return false
    })

    Column(() => {
        Text(` 💻 System: ${os.type()} ${os.release()} (${os.arch()})`);
        Text(` Refresh rate: ${viewModel.refreshRate.value}ms`);
        Text(` Network refresh rate: ${viewModel.networkRefreshRate.value}ms`);
        Text(``)

        CpuInfo(viewModel, new Modifier([
            FillMaxWidthModifier(),
            FillMaxHeightModifier(0.4),
        ]))

        Row(() => {
            MemoryInfo(viewModel, new Modifier([
                FillMaxWidthModifier(0.5),
                FillMaxHeightModifier(),
            ]))

            NetworkInfo(viewModel, new Modifier([
                FillMaxWidthModifier(),
                FillMaxHeightModifier(),
            ]))
        }, new Modifier([
            // Сделать так, чтобы этот виджет занял всю высоту И минус 2 "пикселя?" высоты.
            // Это лучше было бы сделать через Weight или IntrinsicSize, но пока их нет
            ConstraintsModifiers.MinusMaxHeight(2),
        ]))

        Divider(`━`)

        Text(`"9"/"0"/"+"/"-" - increment/decrement refresh rate`)
    }, modifier)
}

function CpuInfo(
    viewModel: MainViewModel,
    modifier: Modifier = new Modifier(),
) {
    BorderedTitledBox(`CPU load:${viewModel.cpuLoad.value.toString().padStart(3, ' ')}%`, () => {
        SolidPlot(
            viewModel.cpuLoadHistory.value,
            new Modifier([FillMaxSizeModifier()]),
            {
                minValue: 0,
                maxValue: 100,
            }
        )

        Column(() => {
            Text(`Processes: ${viewModel.processCount.value ?? '??'}`)
            Text(`Uptime: ${formatUptime(viewModel.uptime.value)}`)
        }, new Modifier([
            OffsetModifier(2, 1)
        ]))
    }, modifier)
}

function MemoryInfo(
    viewModel: MainViewModel,
    modifier: Modifier = new Modifier(),
) {
    BorderedTitledBox(`Memory used:${viewModel.memoryUsagePercent.value.toString().padStart(3, ' ')}%`, () => {
        SolidPlot(
            viewModel.usedMemoryHistory.value,
            new Modifier([FillMaxSizeModifier()]),
            {
                minValue: 0,
                maxValue: 100,
            }
        )

        Column(() => {
            Text(`Total: ${formatMemory(viewModel.totalMemory.value)}`)
            Text(`Free: ${formatMemory(viewModel.freeMemory.value)}`)
        }, new Modifier([
            OffsetModifier(2, 1)
        ]))
    }, modifier)
}

function NetworkInfo(
    viewModel: MainViewModel,
    modifier: Modifier = new Modifier(),
) {
    BorderedTitledBox(`Network`, () => {
        Column(() => {
            Box(() => {
                SolidPlot(
                    viewModel.rxHistory.value,
                    new Modifier([FillMaxSizeModifier()]),
                    { minValue: 0 }
                )

                Column(() => {
                    Text(`download: ${formatMemory(viewModel.rx.value * (viewModel.networkRefreshRate.value / 1000))}/s`)
                }, new Modifier([
                    OffsetModifier(1, 0)
                ]))
            }, new Modifier([
                FillMaxWidthModifier(),

                // Сделать так, чтобы этот виджет занял половину доступной высоты И минус один "пиксель?" высоты.
                // Без этого download виджет будет в среднем на 1-2 "пикселя?" больше по высоте чем upload виджет.
                // Это лучше было бы сделать через Weight или IntrinsicSize, но пока их нет
                ConstraintsModifiers.MinusMaxHeight(1),

                FillMaxHeightModifier(0.5),
            ]))

            Divider('-')

            Box(() => {
                SolidPlot(
                    viewModel.txHistory.value,
                    new Modifier([FillMaxSizeModifier()]),
                    { minValue: 0 }
                )

                Column(() => {
                    Text(`upload: ${formatMemory(viewModel.tx.value * (viewModel.networkRefreshRate.value / 1000))}/s`)
                }, new Modifier([
                    OffsetModifier(1, 0)
                ]))
            }, new Modifier([
                FillMaxWidthModifier(),
                FillMaxHeightModifier(),
            ]))
        })
    }, modifier)
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 3600 / 24)
    const hours = Math.floor(seconds / 3600) - days*24
    const minutes = Math.floor(seconds / 60) - days*24*60 - hours*60
    seconds = seconds - days*24*60*60 - hours*60*60 - minutes*60
    const h = hours.toString().padStart(2, '0')
    const m = minutes.toString().padStart(2, '0')
    const s = seconds.toString().padStart(2, '0')
    if (days !== 0)
        return `${days}d ${h}h ${m}m ${s}s`
    return `${h}h ${m}m ${s}s`
}

function formatMemory(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let unit = 0

    while (bytes >= 1024 && unit < units.length - 1) {
        bytes /= 1024
        unit++
    }

    if (units[unit] === 'GB') {
        return `${parseFloat(bytes.toFixed(2))} ${units[unit]}`
    } else {
        let count = parseFloat(bytes.toFixed(2)).toString()
        if (!count.includes('.'))
            count = `${count}.00`.padStart(6, ' ')
        else if (count[count.length - 2] === '.')
            count = `${count}0`.padStart(6, ' ')
        else
            count = count.padStart(6, ' ')
        return `${count} ${units[unit]}`
    }
}
