import {setTerminalContent} from "../../notcompose-terminal/setTerminalContent";
import {Layout} from "../../notcompose-terminal/runtime/layout/Layout";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {BackgroundModifier} from "../../notcompose-terminal/runtime/modifiers/BackgroundModifier";
import {Placeable} from "../../notcompose-terminal/runtime/layout/Placeable";
import {MeasurePolicy} from "../../notcompose-terminal/runtime/layout/MeasurePolicy";
import {MeasureResult} from "../../notcompose-terminal/runtime/layout/Measurable";


// Давайте создатим кастомный лэяут который распологает детей по горизонтали:
// Сверзу-вниз, Слева-направо
// Вот так:
//
// MyLayout(() => {
//     Text('1')
//     Text('2')
//     Text('3')
//     Text('4')
// })
//
// 1
//  2
//   3
//    4

// Для начала нам нужен MeasurePolicy для нашего лэяута, это правила расположения детей

/**
 * measurables это объекты детей, которых нужно измерить и расположить в текущем лэяуте.
 *
 * constraints это ограничения размера для текущего лэяута.
 * constraints.minWidth - число, минимально возможная ширина для этого лэяута
 * constraints.maxWidth - число, максимально возможная ширина для этого лэяута. Либо null, если ограчений на ширну нет.
 * constraints.minHeight - число, минимально возможная высота для этого лэяута
 * constraints.maxHeight - число, максимально возможная высота для этого лэяута. Либо null, если ограчений на высоту нет.
 *
 * Для каждого ребёнка нужно определить его собственные constraints и передать их в Measurable.
 */
const MyMeasurePolicy: MeasurePolicy = MeasurePolicy((measurables, constraints) => {
    // Это будут конечные размеры нашего лэяута
    let resultWidth = 0
    let resultHeight = 0

    // [constraints] это ограчения размера для текущего лэяута.
    // Например если нам сказали, что наш MyLayout должен быть шириной не меньше 20,
    // это не значит что все его дети тоже должны быть шириной не меньше 20.
    // Поэтому нам нужно скопировать
    let currentChildrenConstraints = constraints.copyMaxDimensions()
    // То-же самое, что и:
    // let currentChildrenConstraints = new Constraints(
    //     0, // minWidth
    //     constraints.maxWidth, // maxWidth
    //     0, // minHeight
    //     constraints.maxHeight, // maxHeight
    // )

    // При измерении Measurable мы получаем Placeable - То, что можно установить.
    const placeables: Placeable[] = []

    // В цикле проходимся по детям, передавая им их констреинты
    for (const measurable of measurables) {
        const placeable = measurable.measure(currentChildrenConstraints)

        // Объект Placeable содержит информацию об измеренном ребёнке: его ширину и высоту
        // Его ширина и высота должны укладываться в [currentChildrenConstraints]
        placeable.width
        placeable.height

        // Ограничим размер каждого следующего ребёнка.
        // Например если ширины не ограничена (=== null), то minusMaxWidth ничего не сделает.
        // А если ограчена, то ширина следующего ребёнка не должна будет привышать
        //   (Текущая максимальная ширина МИНУС Ширина текущего ребёнка)
        currentChildrenConstraints = currentChildrenConstraints
            .minusMaxWidth(placeable.width)
            .minusMaxHeight(placeable.height)

        placeables.push(placeable)
    }

    // Теперь нужно пройтись по всем Placeable, и измерить размер нашего лэяута
    // Так как у нас дети распологаются горизонтально, ширина нашего лэяута равна
    //   сумме широт всех детей, а высота равна сумме высот всех детей
    for (const placeable of placeables) {
        resultWidth = resultWidth + placeable.width
        resultHeight = resultHeight + placeable.height
    }

    // Дополниительно ограничим наши получившиеся размеры с помощью входных constraints,
    //   чтобы размер лэяута соответствовал им.
    // Например если в нашем лэяуте не будет детей, но минимальная ширина будет 0,
    //   то здесь мы установим resultWidth = 20
    resultWidth = constraints.constrainWidth(resultWidth)
    resultHeight = constraints.constrainHeight(resultHeight)

    // В конце MeasurePolicy лямбды нам нужно вернуть MeasureResult
    return MeasureResult(resultWidth, resultHeight, () => {

        // Ну а здесь находится логика расположения всех placeable.
        let currentX = 0
        let currentY = 0
        for (const placeable of placeables) {
            placeable.place(currentX, currentY)
            currentX = currentX + placeable.width
            currentY = currentY + placeable.height
        }

    })
})

// Чуть более компактный вариант реализации
const MyMeasurePolicy2 = MeasurePolicy((measurables, constraints) => {
    let currentConstraints = constraints

    let resultWidth = 0
    let resultHeight = 0
    const placeables = measurables.map((measurable) => {
        const placeable = measurable.measure(currentConstraints)
        currentConstraints = currentConstraints
            .minusMaxWidth(placeable.width)
            .minusMaxHeight(placeable.height)
        resultWidth += placeable.width
        resultHeight += placeable.height
        return placeable
    })

    resultWidth = constraints.constrainWidth(resultWidth)
    resultHeight = constraints.constrainHeight(resultHeight)
    return MeasureResult(resultWidth, resultHeight, () => {
        let currentX = 0
        let currentY = 0
        placeables.forEach((placeable) => {
            placeable.place(currentX, currentY)
            currentX += placeable.width
            currentY += placeable.height
        })
    })
})

// Создание самой функции нашего лэяута
function MyLayout(
    // Контент нашего лэяута
    content: () => void,
    modifier: Modifier = new Modifier()
) {
    Layout(content, MyMeasurePolicy2, modifier)
}

// Теперь проверим:

setTerminalContent(() => {
    MyLayout(() => {
        Text('1')
        Text('2')
        Text('3')
        Text('4')
    }, new Modifier([
        // Заполним фон нашего лэяута решётками, чтобы чётко увидеть границы
        BackgroundModifier('#')
    ]))
})

// Output:

// 1###
// #2##
// ##3#
// ###4
