import {HistoryData} from "./HistoryData";
import {Modifier} from "../../../../notcompose/runtime/Modifier";
import {Alignment, VerticalAlignment} from "../../../../notcompose-terminal/runtime/ui/Alignment";
import {RowWithConstraints} from "../../../../notcompose-terminal/highlevel/WithConstraints";
import {FillMaxWidthModifier} from "../../../../notcompose-terminal/runtime/modifiers/FillModifier";
import {repeat} from "../../../common/repeat";
import {Text} from "../../../../notcompose-terminal/highlevel/Text";
import {Spacer} from "../../../../notcompose-terminal/highlevel/Spacer";
import {BackgroundModifier} from "../../../../notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {HeightModifier, WidthModifier} from "../../../../notcompose-terminal/runtime/modifiers/SizeModifier";
import {Color} from "../../../../notcompose-terminal/runtime/ui/Color";
import {elvis} from "../../../../notcompose/runtime-highlevel/elvis";
import {ColorTextSpan, TextSpan} from "../../../../notcompose-terminal/runtime/ui/TextSpan";
import {AnnotatedString} from "../../../../notcompose-terminal/runtime/ui/AnnotatedString";


export function SolidPlot(
    historyData: HistoryData,
    modifier: Modifier = new Modifier(),
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

    const spans = color !== null
        ? [new TextSpan(new ColorTextSpan(color), 0, 1)]
        : []

    RowWithConstraints(({ maxWidth: plotWidth, maxHeight: plotHeight }) => {
        if (plotWidth === null || plotHeight === null)
            throw new Error('Plot width and height cannot be infinity')

        const emptyColumns = Math.max(0, plotWidth - historyData.items.length)
        const columns = historyData.items.slice(Math.max(0, historyData.items.length - plotWidth), historyData.items.length)

        repeat(emptyColumns, () => {
            Text(new AnnotatedString('▂', spans))
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
                Text(new AnnotatedString('▂', spans))
            } else {
                Spacer(new Modifier([
                    BackgroundModifier('█', { color: color }),
                    WidthModifier(1),
                    HeightModifier(columnHeight),
                ]))
            }
        }
    }, modifier.then(
        FillMaxWidthModifier(),
    ), {
        verticalAlignment: params?.alignment ?? Alignment.Bottom,
    })
}
