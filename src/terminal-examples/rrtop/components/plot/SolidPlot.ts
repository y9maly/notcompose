import {HistoryData} from "./HistoryData.js";
import {elvis} from "notcompose";
import {
    Alignment,
    fillMaxWidth,
    height,
    RowWithConstraints,
    Spacer,
    VerticalAlignment,
    width
} from "notcompose/layout";
import {repeat} from "../../../common/repeat.js";
import {background, Color, colored, Modifier, Text} from "notcompose/terminal";

export function SolidPlot(
    historyData: HistoryData,
    modifier: Modifier = Modifier,
    params?: {
        color?: Color | null,
        minValue?: number,
        maxValue?: number,
        alignment?: VerticalAlignment,
    }
) {
    const { color } = elvis(params, {
        color: null,
    })

    RowWithConstraints(({ maxWidth: plotWidth, maxHeight: plotHeight }) => {
        if (plotWidth === null || plotHeight === null)
            throw new Error('Plot width and height cannot be infinity')

        const emptyColumns = Math.max(0, plotWidth - historyData.items.length)
        const columns = historyData.items.slice(Math.max(0, historyData.items.length - plotWidth), historyData.items.length)

        repeat(emptyColumns, () => {
            Text(colored(color, '▂'))
        })

        const minValue = params?.minValue ?? Math.min(...columns.map(it => it.value))
        const maxValue = params?.maxValue ?? Math.max(...columns.map(it => it.value))
        for (const column of columns) {
            const columnHeight = maxValue - minValue === 0
                ? 0
                : Math.min(
                    plotHeight,
                    Math.round(((column.value - minValue) / (maxValue - minValue)) * plotHeight)
                )

            if (columnHeight === 0) {
                Text(colored(color, '▂'))
            } else {
                Spacer(Modifier
                    .background('█', { color: color })
                    .width(1)
                    .height(columnHeight)
                )
            }
        }
    }, Modifier(modifier).fillMaxWidth(), {
        verticalAlignment: params?.alignment ?? Alignment.Bottom,
    })
}
