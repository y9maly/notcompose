__Сначала прочитайте [корневой README](../README.md)__

# Больше примеров

* [Counter](../examples-terminal/src/terminal/counter)

  https://github.com/user-attachments/assets/e4b7ffd2-bf66-44de-9ed3-e6f236318d36

* [File explorer](../examples-terminal/src/terminal/fileExplorer)

  https://github.com/user-attachments/assets/6d6d6531-273f-48c7-be6a-a66513a3c623

* [rrtop](../examples-terminal/src/terminal/rrtop)

  https://github.com/user-attachments/assets/2ec8a41f-9478-46f5-9834-4f2ed3fa9cb3

* [cube](../examples-terminal/src/terminal/cube)

  https://github.com/user-attachments/assets/310e8f20-f182-436a-971b-e7d1ae346556

## Modifiers

Пакет @notcompose/terminal предоставляет 3 основных модификатора для взаимодействия с терминалом:
* .drawContent    (Для отрисовки на TextCanvas)
* .layout         (Для изменения логики вычисления размера ноды и её позиционирования)
* .handleInput   (Для обработки ввода с клавиатуры)

Эти 3 модификатора не захардкожены:
Например .handleInput реализуется с помощью [InputDispatcher](src/notcompose-terminal/runtime-input/InputDispatcher.ts) и [InputProcessor](src/notcompose-terminal/runtime-input/InputProcessor.ts) - они реализуют логику обработки ввода с клавиатуры, обхода дерева и вызова InputModifier в определённом порядке. Ты можешь реализовать любую другую дополнительную логику поверх дерева написав свой собственный Processor - например, для обратки ввода с помощью мыши (Пока такой встроенной функциональности нет 🤭).

На основе этих трёх модификаторов работают другие. Например модификатор [.border](src/runtime/modifiers/BorderModifier.ts) комбинирует модификатор drawContent (Чтобы нарисовать обводку) и модификатор layout (Чтобы увеличить внешний периметр ноды).

❗️ Чтобы вам были доступны модификаторы из этого пакета, используйте импорт из этого пакета (`@notcompose/terminal`). Вот так: `import { Modifier } from '@notcompose/terminal'`.

❗️ Если у вас уже есть объект типа Modifier, но там не доступны модификаторы терминала, оберните его с помощью Modifier, вот так: `Modifier(modifier)`. Например, чаще всего вы столкнетесь с этим вот в таком случае:
```typescript
function MyWidget(modifier: Modifier) {
    modifier.border() // ERROR: Модификатор border не доступен здесь
    Modifier(modifier).border() // OK: Модификатор border доступен здесь. Цепочка модификаторов оригинального `modifier` будет сохранена.
}
```

### Порядок имеет значение

Так же, как и в Kotlin Compose, порядок модификаторов имеет значение.

TODO // Описать подробнее

[source code](src/terminal-examples/modifier/demo_1.ts)
```typescript
setTerminalContent(() => {
    Column(() => {
        Box(() => {
            Text('Hello')
        }, Modifier
            .background('_')
            .padding({ horizontal: 2, vertical: 2 })
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .padding({ horizontal: 2, vertical: 2 })
            .background('_')
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .background('_')
            .padding({ horizontal: 2, vertical: 2 })
            .size(7)
        )

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, Modifier
            .size(7)
            .background('_')
            .padding({ horizontal: 2, vertical: 2 })
        )
    })
})

// Output:
// _________
// _________
// __Hello__
// _________
// _________
// -----------------------------------------
//
//
//   Hello
//
//
// -----------------------------------------
// ___________
// ___________
// __Hello____
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// ___________
// -----------------------------------------
// _______
// _______
// __Hel__
// _______
// _______
// _______
// _______
```

В примере выше можно увидеть как от порядка модификаторов зависит фактический результат.
Каждый layout-модификатор оборачивает следующий.
Порядок применения модификаторов обратный (так же, как в Kotlin Compose)

Давай разберём каждый случай по отдельности:

### Случай 1

```typescript
Box(() => {
    Text('Hello')
}, Modifier
    .background('_')
    .padding({ horizontal: 2, vertical: 2 })
)
```

```
_________
_________
__Hello__
_________
_________
```

В данном случае:
* Сначала измерится изначальный размер Box (он будет равен 5x1) ([Исходный код BoxMeasurePolicy](src/notcompose-layout/highlevel/Box.ts))
* Затем применится модификатор Padding, который увеличит размер лэяута на 4 единицы по высоте и ширине, затем модификатор Padding расположит оригинальный Box по координатам x=2, y=2. Теперь размер лэяута равен 9x5 ([Исходный код PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts))
* Затем запустится модификатор BackgroundModifier, и так как размер лэяута 9x5, фон нарисуется размером 9x5

Более подробно:
* Фаза Measurement:
* Сначала measure вызовется на [PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts), он уменьшит максимальные constraints на 4 по ширине и высоте, и начнёт измерять оригинальный контент в Box используя [BoxMeasurePolicy](src/notcompose-layout/highlevel/Box.ts)
* [BoxMeasurePolicy](src/notcompose-layout/highlevel/Box.ts) вернёт размер 5x1
* [PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts) увеличит этот размер на 4 единицы по высоте и ширине, и вернёт модифицированный MeasureResult с новым размером.
* Фаза Positioning:
* Вызывается [PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts).placeChildren(), он располагает следующий Layout-элемент (оригинальный [BoxMeasurePolicy](src/notcompose-layout/highlevel/Box.ts)) по относительным координатам x=2 y=2
* Фаза Drawing:
* Так как BackgroundModifier применён ПОСЛЕ PaddingModifier, ему приходит информация о модифицированных им размерах лэяута, а именно 9x5. Поэтому отрисовка фона в данном случае рисует область размером 9x5

### Случай 2

```typescript
Box(() => {
    Text('Hello')
}, Modifier
    .padding({ horizontal: 2, vertical: 2 })
    .background('_'),
)
```

```


  Hello


```

Объяснение аналогично 1 случаю, но здесь, так как BackgroundModifier применён ДО PaddingModifier (помним, что порядок обратный), рисование произойдет в контексте ещё не модифицированных размера лэяута и позиционирования.
Поэтому фон фактически отрисовался, но тут же перекрылся текстом Hello (Сначала рисуется контент родителей, потом в порядке очереди контент всех детей - Поэтому самый последний дочерний элемент будет иметь приоритет на отрисовку и перезапишет предыдущие записи)

### Случай 3

```typescript
Box(() => {
    Text('Hello')
}, Modifier
    .background('_')
    .padding({ horizontal: 2, vertical: 2 })
    .size(7)
)
```

```
___________
___________
__Hello____
___________
___________
___________
___________
___________
___________
___________
___________
```

Здесь добавляется модификатор [SizeModifier](src/notcompose-terminal/modifiers/SizeModifier.ts) который заставляет оригинальный лэяут стать размером 7x7 (constraints = { minWidth: 7, maxWidth: 7, minHeight: 7, maxHeight: 7 }).
[BoxMeasurePolicy](src/notcompose-layout/highlevel/Box.ts) Уважает эти constraints и становится размером 7x7.
[PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts) добавляет ещё 4 пикселя размера по вертикали и горизонтали.
[BackgroundModifier](src/notcompose-terminal/modifiers/BackgroundModifier.ts) рисуется в области 11x11

### Случай 4

TODO

## Layouts

Есть несколько стандартных лэяутов: Box, Column, Row для расположения детей друг поверх друга, вертикально и горизонтально соответственно.

Размер Box определяется так: Ширина равна ширине самого широкого ребёнка; Высота равна высоте самого высокого ребёнка.
Размер Column определяется так: Ширина равна ширине самого широкого ребёнка; Высота равна сумме высот всех детей.
Размер Row определяется так: Ширина равна сумме ширин всех детей; Высота равна высоте самого высокого ребёнка.

## Создание собственного Layout

### MeasurePolicy

Можно создать свой лэяут с помощью функции Layout передав MeasurePolicy.

[source code](src/terminal-examples/layout/demo_1.ts)
```typescript
// Давайте создадим кастомный лэяут который располагает детей по диагонали:
// Сверху вниз, слева направо
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
 * constraints.maxWidth - число, максимально возможная ширина для этого лэяута. Либо null, если ограничений на ширину нет.
 * constraints.minHeight - число, минимально возможная высота для этого лэяута
 * constraints.maxHeight - число, максимально возможная высота для этого лэяута. Либо null, если ограничений на высоту нет.
 *
 * Для каждого ребёнка нужно определить его собственные constraints и передать их в Measurable.
 */
const MyMeasurePolicy: MeasurePolicy = MeasurePolicy((measurables, constraints) => {
    // Это будут конечные размеры нашего лэяута
    let resultWidth = 0
    let resultHeight = 0

    // [constraints] это ограничения размера для текущего лэяута.
    // Например если нам сказали, что наш MyLayout должен быть шириной не меньше 20,
    // это не значит что все его дети тоже должны быть шириной не меньше 20.
    // Поэтому нам нужно скопировать только максимальные ограничения
    let currentChildrenConstraints = constraints.copyMaxDimensions()
    // То же самое, что и:
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
        // Например если ширина не ограничена (=== null), то minusMaxWidth ничего не сделает.
        // А если ограничена, то ширина следующего ребёнка не должна будет превышать
        //   (Текущая максимальная ширина МИНУС Ширина текущего ребёнка)
        currentChildrenConstraints = currentChildrenConstraints
            .minusMaxWidth(placeable.width)
            .minusMaxHeight(placeable.height)

        placeables.push(placeable)
    }

    // Теперь нужно пройтись по всем Placeable, и измерить размер нашего лэяута
    // Так как у нас дети располагаются по диагонали, ширина нашего лэяута равна
    //   сумме ширин всех детей, а высота равна сумме высот всех детей
    for (const placeable of placeables) {
        resultWidth = resultWidth + placeable.width
        resultHeight = resultHeight + placeable.height
    }

    // Дополнительно ограничим наши получившиеся размеры с помощью входных constraints,
    //   чтобы размер лэяута соответствовал им (Уважаем входные constraints).
    // Например если в нашем лэяуте не будет детей, но constraints.minWidth = 20,
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

// Создание самой функции нашего лэяута
function MyLayout(
    // Контент нашего лэяута
    content: () => void,
    modifier: Modifier = Modifier
) {
    Layout(content, MyMeasurePolicy, modifier)
}

// Теперь проверим:

setTerminalContent(() => {
    MyLayout(() => {
        Text('1')
        Text('2')
        Text('3')
        Text('4')
    }, Modifier
        // Заполним фон нашего лэяута решётками, чтобы чётко увидеть границы
        .background('#')
    )
})
```

Ураа, у нас получилось:

```
1###
#2##
##3#
###4
```

## SubcomposeLayout

Этапы работы фреймворка можно разделить на 3 части:
- Composition (построение дерева элементов)
- Layout (Измерение размеров элементов и их позиций)
- - Подфаза Measurement (Измерение размеров элементов)
- - Подфаза Placement (Позиционирование элементов)
- Drawing (Отрисовка)

Каждая фаза идёт одна за другой. Но иногда может понадобиться информация из фазы Measurement для того, чтобы построить дерево. Как же быть?

### LayoutWithConstraints

Например, для того чтобы построить дерево нам нужно знать то, насколько большими могут быть элементы: Для этого нужно знать constraints.
В веб-разработке, например, перед тем как отрисовать HTML страничку полезно сначала узнать: А какого размера у нас экран? Нам нужна мобильная вёрстка или десктопная?

В данном случае нам помогут LayoutWithConstraints/BoxWithConstraints/ColumnWithConstraints/RowWithConstraints.
Они принимают не просто `content: () => void`, а `content: (constraints: Constraints) => void`.

Это работает так:
 * Когда `*WithConstraints` строится в дереве, он не строит своих детей сразу, а говорит "У меня пока нету детей".
 * Когда всё дерево построено, фреймворк переходит к фазе Measurement, и запускает её с самого корневого элемента. Когда запрос [measure] доходит до `*WithConstraints` он возвращается в фазу Composition, передаёт constraints который ему передали в функцию measure, достраивает дерево, а затем снова возвращается к фазе Measurement.
 Помните когда мы вызывали функцию measure на объекте Measurable в MyMeasurePolicy? Именно здесь это запускается, если ребёнок это `*WithConstraints`.

[source code](src/terminal-examples/layout/demo_2.ts)
```typescript
setTerminalContent(() => {
    ColumnWithConstraints((constraints: Constraints) => {
        Text(`Ширина терминала: ${constraints.maxWidth}`)
        Text(`Высота терминала: ${constraints.maxHeight}`)

        // In our case `constraints.maxWidth` will never be null.
        // But in some cases it is useful to catch this.
        if (constraints.maxWidth === null || constraints.maxWidth > 70) {
            LargeScreen()
        } else {
            SmallScreen()
        }
    })
})

function LargeScreen() {
    Row(() => {
        Text('Это вёрстка для широкого экрана')
        Text(' | ')
        Text('Сюда влезет много широкого контента')
    })
}

function SmallScreen() {
    Column(() => {
        Text('Это вёрстка для маленького экрана')
        Text('')
        Text('Сюда не влезет много контента')
    })
}

// Output if terminal width less than 70:
// Ширина терминала: 42
// Высота терминала: 35
// Это вёрстка для маленького экрана
//
// Сюда не влезет много контента

// Output if terminal width more than 70:
// Ширина терминала: 100
// Высота терминала: 35
// Это вёрстка для широкого экрана | Сюда влезет много широкого контента
```

Кстати, именно благодаря этому [пример файлового менеджера](src/terminal-examples/fileExplorer) адаптируется по высоте, выбирая, сколько элементов он может отобразить на текущем экране.

### SubcomposeLayout

Во многом похож на SubcomposeLayout из Kotlin Compose.

Иногда нужно получить ещё больше информации и контроля. Например измерить одного ребёнка, и исходя из его размеров и выходных constraints построить второго ребёнка.

TODO // Описать подробнее

[source code](src/terminal-examples/layout/demo_3.ts)
```typescript
setTerminalContent(() => {
    const textField = rememberState(() => '')

    input((str, key) => {
        if (key && key.name === 'backspace' || key.name === 'delete') {
            textField.value = textField.value.slice(0, -1)
        } else {
            textField.value += str
        }
        return true
    })

    SubcomposeLayout((constraints) => {
        const placeable1 = subcompose(() => {
            Text(`> ${textField.value}`)
        })[0].measure(constraints)

        const placeable2 = subcompose(() => {
            if (placeable1.width > 30) {
                Key(1, () => {
                    Row(() => {
                        Text('Ты ввёл много текста')
                        Text(' | ')
                        Text('Даже слишком много...')
                    })
                })
            } else {
                Key(2, () => {
                    Text('Ты ввёл мало текста')
                })
            }
        })[0].measure(constraints)

        const width = placeable1.width
        const height = 3
        return MeasureResult(width, height, () => {
            placeable1.place(0, 0)
            placeable2.place(0, 2)
        })
    })
})

// Output when textField.value.length <= 30:
// > qwerty
//
// Ты ввёл мало текста

// Output while textField.value.length > 30:
// > qwertyuiopqwertyuiopqwertyuiop
// 
// Ты ввёл много текста | Даже слишком много...
```

В этом примере мы сначала создаём первого ребёнка, смотрим на его ширину, и в зависимости от этого строим второго ребёнка.
Не забываем использовать Key чтобы явно дать знать фреймворку какая ветка сейчас выполняется.

P.S. На самом деле "Ты ввёл мало текста" будет отображаться всегда, если ширина терминала меньше 30.
Так как мы смотрим не на фактический размер введённого текста, а на ширину [placeable1].
А он никогда не станет шире чем терминал, вне зависимости от размера введённой строки.

## Plugins & Processors

TODO
