import { Modifier } from 'notcompose'
import { MainViewModel } from './MainViewModel.js'
import { BorderedTitledBox } from '../components/BorderedTitledBox.js'
import { Box, Column, ConstraintsModifiers, fillMaxHeight, fillMaxSize, fillMaxWidth, offset, Row } from 'notcompose/layout'
import { SolidPlot } from '../components/plot/SolidPlot.js'
import { annotated, bold, Color, colored, input, Text } from 'notcompose/terminal'
import { Divider } from '../../common/Divider.js'

const minusMaxHeight = ConstraintsModifiers.minusMaxHeight

export function MainScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier,
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

    const system = `${viewModel.osType.value} ${viewModel.osRelease.value} (${viewModel.arch.value})`
    const refreshRate = `${viewModel.refreshRate.value}ms`
    const networkRefreshRate = `${viewModel.networkRefreshRate.value}ms`

    Column(() => {
        Text(annotated`💻 ${colored(Color.DarkCyan, bold(`System:`))} ${colored(Color.LightGray, system)}`)
        Text(annotated`    ${colored(Color.DarkCyan, bold(`Refresh rate:`))} ${colored(Color.LightGray, refreshRate)}`)
        Text(annotated`    ${colored(Color.DarkCyan, bold(`Network refresh rate:`))} ${colored(Color.LightGray, networkRefreshRate)}`)

        Text(``)

        CpuInfo(viewModel, Modifier
            .then(fillMaxWidth())
            .then(fillMaxHeight(0.4))
        )

        Row(() => {
            MemoryInfo(viewModel, Modifier
                .then(fillMaxWidth(0.5))
                .then(fillMaxHeight())
            )

            NetworkInfo(viewModel, Modifier
                .then(fillMaxWidth())
                .then(fillMaxHeight())
            )
        }, Modifier
            // Сделать так, чтобы этот виджет занял всю высоту И минус 2 "пикселя?" высоты.
            // Это лучше было бы сделать через Weight или IntrinsicSize, но пока их нет
            .then(minusMaxHeight(2))
        )

        Divider(`━`)

        Text(`"9"/"0"/"+"/"-" - increment/decrement refresh rate`)
    }, modifier)
}

function CpuInfo(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier,
) {
    const cpuLoad = viewModel.cpuLoad.value.toString().padStart(3, ' ')
    const processes = viewModel.processCount.value ?? '??'
    const uptime = formatUptime(viewModel.uptime.value)

    BorderedTitledBox(
        () => Text(colored(Color.LightGray, `CPU load:${cpuLoad}%`)),
        () => {
            SolidPlot(
                viewModel.cpuLoadHistory.value,
                Modifier.then(fillMaxSize()),
                {
                    color: Color.Gray,
                    minValue: 0,
                    maxValue: 100,
                }
            )

            Column(() => {
                Text(colored(Color.Gray, `Processes: ${processes}`))
                Text(colored(Color.Gray, `Uptime: ${uptime}`))
            }, Modifier.then(offset(2, 1)))
        }, modifier, {
            color: Color.DarkGray,
        }
    )
}

function MemoryInfo(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier,
) {
    const total = formatBytes(viewModel.totalMemory.value)
    const free = formatBytes(viewModel.freeMemory.value)
    const memoryUsageValue = viewModel.memoryUsagePercent.value
    const memoryUsage = memoryUsageValue.toString().padStart(3, ' ') + '%'
    const memoryColor =
        memoryUsageValue >= 90 ? new Color(0xff7D2D27)
            : memoryUsageValue >= 80 ? new Color(0xff746237)
                : new Color(0xff28632F)

    BorderedTitledBox(() => {
        Text(colored(Color.LightGray, `Memory used:`)
            .plus(colored(memoryColor, memoryUsage))
        )
    }, () => {
        SolidPlot(
            viewModel.usedMemoryHistory.value,
            Modifier.then(fillMaxSize()),
            {
                color: Color.Gray,
                minValue: 0,
                maxValue: 100,
            }
        )

        Column(() => {
            Text(colored(Color.Gray, `Total: ${total}`))
            Text(colored(Color.Gray, `Free: ${free}`))
        }, Modifier.then(offset(2, 1)))
    }, modifier, {
        color: Color.DarkGray,
    })
}

function NetworkInfo(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier,
) {
    const download = `${formatBytes(viewModel.rx.value * (viewModel.networkRefreshRate.value / 1000))}/s`
    const upload = `${formatBytes(viewModel.tx.value * (viewModel.networkRefreshRate.value / 1000))}/s`

    BorderedTitledBox(() => {
        Text(colored(Color.LightGray, `Network`))
    }, () => {
        Column(() => {
            Box(() => {
                SolidPlot(
                    viewModel.rxHistory.value,
                    Modifier.then(fillMaxSize()),
                    {
                        color: Color.Gray,
                        minValue: 0,
                    }
                )

                Column(() => {
                    Text(colored(Color.Gray, `download: ${download}`))
                }, Modifier.then(offset(1, 0)))
            }, Modifier
                .then(fillMaxWidth())
                // Сделать так, чтобы этот виджет занял половину доступной высоты И минус один "пиксель?" высоты.
                // Без этого download виджет будет в среднем на 1-2 "пикселя?" больше по высоте чем upload виджет.
                // Это лучше было бы сделать через Weight или IntrinsicSize, но пока их нет
                .then(minusMaxHeight(1))
                .then(fillMaxHeight(0.5))
            )

            Divider('-', { color: Color.DarkGray })

            Box(() => {
                SolidPlot(
                    viewModel.txHistory.value,
                    Modifier.then(fillMaxSize()),
                    {
                        color: Color.Gray,
                        minValue: 0,
                    }
                )

                Column(() => {
                    Text(colored(Color.Gray, `upload: ${upload}`))
                }, Modifier.then(offset(1, 0)))
            }, Modifier.then(fillMaxSize()))
        })
    }, modifier, {
        color: Color.DarkGray,
    })
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

function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let unit = 0

    while (bytes >= 1024 && unit < units.length - 1) {
        bytes /= 1024
        unit++
    }

    if (parseFloat(bytes.toFixed(2)) >= 1000 && unit < units.length - 1) {
        bytes /= 1024
        unit++
    }

    if (units[unit] === 'GB') {
        return `${bytes.toFixed(2)} ${units[unit]}`
    } else {
        const count = bytes.toFixed(2).padStart(6, ' ')
        return `${count} ${units[unit]}`
    }
}
