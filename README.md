# Что это?

Нууу я решил па приколу сделать что-то типа Jetpack Compose на JS.

В этом репозитории пока что только имплементация для TUI, но runtime часть позволяет строить любые деревья.
Здесь тоже есть Composer который строит дерево, отслеживает стейты, запускает рекомпозиции и так далее.
Это не попытка полностью скопировать Kotlin Compose: некоторые концепции отличаются, ну а с некоторыми в оригинальном Kotlin Compose я вообще даже не разбирался.

# Примеры

 * [Counter](src/terminal-examples/counter)

   https://github.com/user-attachments/assets/b5c395c7-880c-447c-a3a6-cf89884d23e1

 * [File explorer](src/terminal-examples/fileExplorer)

   https://github.com/user-attachments/assets/0053a14b-3c0f-4d88-9bc2-f826916aed50

 * [rrtop](src/terminal-examples/rrtop)

   https://github.com/user-attachments/assets/c43f7008-8e7f-4e25-bdd4-2ff037141147

# Как назвать этот заголовок?

Я не знаю можно ли назвать это фреймворком, но формально это он. Поэтому дальше буду использовать это определение.

## Working with state

Также как и в Kotlin Compose здесь есть State и MutableState.
Когда стейт читается внутри композиции - он "прикрепляется" к ней, и теперь когда он изменится произойдет рекомпозиция.

[source code](src/terminal-examples/workingWithState/demo_1.ts)
```typescript
const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

setTerminalContent(() => { /* root composable lambda */
    Text(`counter ${counter.value}`)
})
```

В примере выше в корневой ноде прочитался стейт counter, runtime фреймворка увидел это и привязал этот стейт к корневой ноде.
Теперь когда counter изменится фреймворк запустит лямбду /* root composable lambda */ и отрисует изменения в терминал.

[source code](src/terminal-examples/workingWithState/demo_1.ts)
```typescript
const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

let frames = 0
setTerminalContent(() => { /* root composable lambda */
    frames++
    Text(`counter ${counter.value} (frame ${frames})`)
})
```

Если отследить сколько раз /* root composable lambda */ то можно увидеть, что в секунду рисуется ровно 1 кадр.
Чтение [frames] здесь ничего не значит для фреймворка, так как это не объект State.
Только чтение свойства [state] у объекта State<T> привязывает стейт к ноде.


[source code](src/terminal-examples/workingWithState/demo_2.ts)
```typescript
const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

let rootFrames = 0
let columnFrames = 0
let boxFrames = 0
setTerminalContent(() => { /* root composable lambda */
    rootFrames++

    Column(() => {
        columnFrames++

        Text(`root frames: ${rootFrames}`)
        Text(`column frames: ${columnFrames}`)

        Box(() => {
            boxFrames++

            // state read
            counter.value

            Text(`box frames: ${boxFrames}`)
        })
    })
})
```

Еще можно посмотреть на пример выше. В данном примере будет увеличиваться только счётчик [boxFrames] на экране. [rootFrames] и [columnFrames] всегда будут отображаться как 1.

## Remembered values

remember работает также как в Kotlin compose.

[source code](src/terminal-examples/remember/demo_1.ts)
```typescript
setTerminalContent(() => {
    const screen = remember(() => mutableStateOf(1))

    input((str) => {
        if (str === '1') {
            screen.value = 1
            return true
        } else if (str === '2') {
            screen.value = 2
            return true
        }

        return false
    })

    if (screen.value === 1) {
        Key('Screen 1', () => {
            Screen1()
        })
    }

    if (screen.value === 2) {
        Key('Screen 2', () => {
            Screen2()
        })
    }
})

function Screen1() {
    const screen1Counter = remember(() => mutableStateOf(0))

    input((str) => {
        if (str === ' ') {
            screen1Counter.value++
            return true
        }

        return false
    })

    Column(() => {
        Text('Screen 1')

        Text(`counter: ${screen1Counter.value}`)
    })
}

function Screen2() {
    Column(() => {
        Text('Screen 2')
    })
}
```

В примере выше создали 2 экрана.

Key с уникальным ключём использовать обязательно для каждого ветвления (if, for циклов и тд), иначе у фреймворка не будет способа узнать что во время рекомпозиции выполнилась другая ветка, и это может привести к Undefined Behaviour.

Функция input используется для обработки ввода с клавиатуры. Первый экран отслеживает нажатие пробела, а корневой отслеживает переключения экранов. Из лямбды-обработчика нужно вернуть true чтобы не вызывались следующие обработчики. Сначала вызываются обработчики родительских, а потом по очереди обработчики дочерних нод. То-есть, если нажать "1" в этом примере, то обработчик в Screen1 даже не узнает об этом.

Если покликать пробел на экране 1, затем уйти на экран 2, а затем снова вернутся на экран 1 - то счётчик на экране 1 обнулится.

[source code](src/terminal-examples/remember/demo_2.ts)
```typescript
const counter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    counter.value++
}, 1000)

setTerminalContent(() => {
    const date: number = remember([counter.value], () => Date.now())

    Text(`Now date: ${date}`)
})
```

[remember] поддерживает ключи: Если первым аргументом передан массив ключей, то значение будет пересчитано каждый раз, когда ключи меняются.

В этом примере каждую секунду (чуть больше секунды) будет обновлятся переменная [date], так как ключ counter меняется каждую секунду.
Так, [date] всегда будет содержать текущее время с точностью до секунды.

[source code](src/terminal-examples/remember/demo_3.ts)
```typescript
const globalCounter: MutableState<number> = mutableStateOf(0)

setInterval(() => {
    globalCounter.value++
}, 5000)

setTerminalContent(() => {
    const localCounter = rememberState([globalCounter.value], () => 0)

    input((str) => {
        if (str === ' ')
            localCounter.value++
        return true
    })

    Text(`Local counter: ${localCounter.value}`)
})
```

Счётчик в примере выше будет сбрасываться каждые 5 секунд.

Используется функция rememberState:

 * `rememberState(() => 0)` и `remember(() => mutableStateOf(0))` - Это одно и то же. Так писать можно.

 * `remember([globalCounter.value], () => mutableStateOf(0))` - ЭТО ОШИБКА. Так писать нельзя. Потому-что объект State в таком случае будет пересоздан при измении ключей, и фреймворк не сможет правильно обработать рекомпозицию. Объект State должен быть использован в композиции уникально, без пересоздания.

 * `rememberState([globalCounter.value], () => 0)` - Так писать можно. Функция rememberState работает по другому, если ей передан список ключей: Она всегда сохраняет один и тот же инстанс State, но перевычисляет САМО значение когда ключи изменились - и изменяет state.value, не меняя сам инстанс объекта state.

 * В общем лучше всегда использовать rememberState

 * [remember] можно использовать ТОЛЬКО во время композиции. Поэтому в примерах выше, где стейт создавался за пределами композиции я использовал [mutableStateOf].

## Effects

### LaunchedEffect

LaunchedEffect запускает лямбду когда он вошёл в композицию.
Опциально принимает ключи и перезапускается когда ключи изменились.

[source code](src/terminal-examples/effects/demo_1.ts)
```typescript
const screen1LaunchedEffectCounter = mutableStateOf(0)

setTerminalContent(() => {
    const screen = remember(() => mutableStateOf(1))

    input((str) => {
        if (str === '1') {
            screen.value = 1
            return true
        } else if (str === '2') {
            screen.value = 2
            return true
        }

        return false
    })

    Column(() => {
        Text(`screen1LaunchedEffectCounter: ${screen1LaunchedEffectCounter.value}`)

        if (screen.value === 1) {
            Key('Screen 1', () => {
                Screen1()
            })
        }

        if (screen.value === 2) {
            Key('Screen 2', () => {
                Screen2()
            })
        }
    })
})

function Screen1() {
    LaunchedEffect(() => { /* LaunchedEffect lambda */
        screen1LaunchedEffectCounter.value++
    })

    Column(() => {
        Text('Screen 1')
    })
}

function Screen2() {
    Column(() => {
        Text('Screen 2')
    })
}
```

В примере выше лямбда /* LaunchedEffect lambda */ будет запущена на первом кадре, а также каждый раз, когда мы переключаемся с экрана 2 на экран 1.

### DisposableEffect

Работает также как и LaunchedEffect, но из лямбды можно вернуть другую лямбду, которая вызовется при выходе этого DisposableEffect из композиции.
Нужен для очистки ресурсов.
Он также может принимать keys.

[source code](src/terminal-examples/effects/demo_2.ts)
```typescript
setTerminalContent(() => {
    const screen = remember(() => mutableStateOf(1))

    input((str) => {
        if (str === '1') {
            screen.value = 1
            return true
        } else if (str === '2') {
            screen.value = 2
            return true
        }

        return false
    })

    Column(() => {
        if (screen.value === 1) {
            Key('Screen 1', () => {
                Screen1()
            })
        }

        if (screen.value === 2) {
            Key('Screen 2', () => {
                Screen2()
            })
        }
    })
})

function Screen1() {
    const localCounter = rememberState(() => 0)

    DisposableEffect(() => { /* DisposableEffect lambda 1 */
        const interval = setInterval(() => {
            localCounter.value++
        }, 1000)

        return () => { /* DisposableEffect lambda 2 */
            clearInterval(interval)
        }
    })

    Column(() => {
        Text('Screen 1')
        Text(`localCounter ${localCounter.value}`)
    })
}

function Screen2() {
    Column(() => {
        Text('Screen 2')
    })
}
```

В примере выше мы используем DisposableEffect чтобы установить интервал, который каждую секунду будет инкрементировать [localCounter].
/* DisposableEffect lambda 1 */ Вызывается каждый раз, когда Screen1 входит в композицию.
А при выходе Screen1 из композиции вызывается /* DisposableEffect lambda 2 */.

В примере выше мы делаем clearInterval чтобы очистить ресурсы (ненужный нам больше интервал).

### SideEffect

TODO

## Layouts

Есть несколько стандартных лэяутов: Box, Column, Row для расположения детей друг поверх друга, вертикально и горизонтально соответственно.

Размер Box определяется так: Ширина равна ширине самого широкого ребёнка; Высота равна высоте самого высокого ребёнка.
Размер Column определяется так: Ширина равна ширине самого широкого ребёнка; Высота равна сумме высот всех детей.
Размер Box определяется так: Ширина равна сумме широт всех детей; Высота равна высоте самого высокого ребёнка.

### MeasurePolicy

Можно создать свой лэяут с помощью функции Layout передав MeasurePolicy.

[source code](src/terminal-examples/layout/demo_1.ts)
```typescript
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
    // Поэтому нам нужно скопировать только максимальные ограничения
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
        // Например если ширина не ограничена (=== null), то minusMaxWidth ничего не сделает.
        // А если ограчена, то ширина следующего ребёнка не должна будет привышать
        //   (Текущая максимальная ширина МИНУС Ширина текущего ребёнка)
        currentChildrenConstraints = currentChildrenConstraints
            .minusMaxWidth(placeable.width)
            .minusMaxHeight(placeable.height)

        placeables.push(placeable)
    }

    // Теперь нужно пройтись по всем Placeable, и измерить размер нашего лэяута
    // Так как у нас дети распологаются по диагонали, ширина нашего лэяута равна
    //   сумме широт всех детей, а высота равна сумме высот всех детей
    for (const placeable of placeables) {
        resultWidth = resultWidth + placeable.width
        resultHeight = resultHeight + placeable.height
    }

    // Дополниительно ограничим наши получившиеся размеры с помощью входных constraints,
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
    modifier: Modifier = new Modifier()
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
    }, new Modifier([
        // Заполним фон нашего лэяута решётками, чтобы чётко увидеть границы
        BackgroundModifier('#')
    ]))
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

Каждая фаза идёт одна за другой. Но иногда может понадобится информация из фазы Measurement для того, чтобы построить дерево. Как же быть?

### LayoutWithConstraints

Например, для того чтобы построить дерево нам нужно знать то, несколько большим могут быть элементы: Для этого нужно знать constraints.
В веб-разработке, например, перед тем как отрисовать HTML страничку полезно сначала узнать: А какого размера у нас экран? Нам нужна мобильная вёрстка или десктопная?

В данном случае нам помогут LayoutWithConstraints/BoxWithConstraints/ColumnWithConstraints/RowWithConstraints.
Они принимают не просто `content: () => void`, а `content: (constraints: Constraints) => void`.

Это работает так:
 * Когда *WithConstraints строится в дереве, он не строит своих детей сразу, а говорит "У меня пока нету детей".
 * Когда всё дерево построено, фреймворк переходит к фазе Measurement, и запускает её с самого корневого элемента. Когда запрос [measure] доходит до *WithConstraints он возвращается в фазу Composition, передает constraints который ему передали в функцию measure, достраивает дерево, а затем снова возвращается к фазе Measurement.
 Помните когда мы вызывали функцию measure на объекте Measurable в MyMeasurePolicy? Именно здесь это запускается, если ребёнок это *WithConstraints.

[source code](src/terminal-examples/layout/demo_2.ts)
```typescript
setTerminalContent(() => {
    ColumnWithConstraints((constraints: Constraints) => {
        Text(`Ширина терминала: ${constraints.maxWidth}`)
        Text(`Высота терминала: ${constraints.maxHeight}`)

        // In out case `constraints.maxHeight` will never be null.
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

В этом примере мы сначала создаём первого ребёнка, смотрим на его ширину, и в зависимости от этого строим второго ребёка.
Не забываем использовать Key чтобы явно дать знать фреймворку какая ветка сейчас выполняется.

## Modifiers

Есть 3 основных модификатора:
 * RawTextModifier (Для отрисовки на TextCanvas)
 * LayoutModifier  (Для изменения логики вычисления размера и позиционирования)
 * InputModifier   (Для обработки ввода)

Любой другой модификатор может быть добавлен, они не захардкожены.

Например InputModifier реализует [InputDispatcher](src/notcompose-terminal/runtime-input/InputDispatcher.ts) и [InputProcessor](src/notcompose-terminal/runtime-input/InputProcessor.ts) - они реализуют логику обработки ввода с клавиатуры, обхода дерева и вызыва InputModifier в определённом порядке. Ты можешь реализовать любую другую дополнительную логику поверх дерева написав свой собственный Processor.

Также как и в Kotlin Compose порядок модификаторов имеет значение.

TODO // Описать подробнее

[source code](src/terminal-examples/modifier/demo_1.ts)
```typescript
setTerminalContent(() => {
    Column(() => {
        Box(() => {
            Text('Hello')
        }, new Modifier([
            BackgroundModifier('_'),
            PaddingModifier({ horizontal: 2, vertical: 2 }),
        ]))

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, new Modifier([
            PaddingModifier({ horizontal: 2, vertical: 2 }),
            BackgroundModifier('_'),
        ]))

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, new Modifier([
            BackgroundModifier('_'),
            PaddingModifier({ horizontal: 2, vertical: 2 }),
            SizeModifier(7),
        ]))

        Text('-----------------------------------------')

        Box(() => {
            Text('Hello')
        }, new Modifier([
            SizeModifier(7),
            BackgroundModifier('_'),
            PaddingModifier({ horizontal: 2, vertical: 2 }),
        ]))
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
Порядок применения модификаторов обратный (Также как в Kotlin Compose)

Давай разребём каждый случай по отдельности:

### Случай 1

```typescript
Box(() => {
    Text('Hello')
}, new Modifier([
    BackgroundModifier('_'),
    PaddingModifier({ horizontal: 2, vertical: 2 }),
]))
```

```
_________
_________
__Hello__
_________
_________
```

В данном случае:
 * Сначала измерится изначальный размер Box (он будет равен 5x1) ([Исходный код BoxMeasurePolicy](src/notcompose-terminal/highlevel/Box.ts))
 * Затем применится модификатор Padding, который увеличит размер лэяута на 4 единицы по высоте и ширине, затем модификатор Padding расположит оригинальный Box по координатам x=2, y=2. Теперь размер лэяута равен 9x5 ([Исходный код PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts))
 * Затем запустится модификатор BackgroundModifier, и так как размер лэяута 9x5, фон нарисуется размером 9x5

Более подробно:
 * Фаза Measurement:
 * Сначала measure вызовется на [PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts), он уменьшит максимальные constraints на 4 по ширине и высоте, и начнёт измерять оригинальный контент в Box используя [BoxMeasurePolicy](src/notcompose-terminal/highlevel/Box.ts)
 * [BoxMeasurePolicy](src/notcompose-terminal/highlevel/Box.ts) вернёт размер 5x1
 * [PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts) увеличит этот размер на 4 единицы по высоте и ширине, и вернет модифицированный MeasureResult с новым размером.
 * Фаза Positioning:
 * Вызывается [PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts).placeChildren(), он распологает следующий Layout-элемент (оригинальный [BoxMeasurePolicy](src/notcompose-terminal/highlevel/Box.ts)) по относительным координатам x=2 y=2
 * Фаза Drawing:
 * Так как BackgroundModifier применён ПОСЛЕ PaddingModifier, ему приходит информация об модифицированных им размерах лэяута, а именно 9x5. Поэтому отрисовка фона в данном случае рисует квадрат размером 9x5

### Случай 2

```typescript
Box(() => {
    Text('Hello')
}, new Modifier([
    PaddingModifier({ horizontal: 2, vertical: 2 }),
    BackgroundModifier('_'),
]))
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
}, new Modifier([
    BackgroundModifier('_'),
    PaddingModifier({ horizontal: 2, vertical: 2 }),
    SizeModifier(7),
]))
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
[BoxMeasurePolicy](src/notcompose-terminal/highlevel/Box.ts) Уважает эти constraints и становится размером 7x7.
[PaddingModifier](src/notcompose-terminal/modifiers/PaddingModifier.ts) добавляет ещё 4 пикселя размера по вертикали и горизонтали.
[BackgroundModifier](src/notcompose-terminal/modifiers/BackgroundModifier.ts) рисуется в области 11x11

### Случай 4

TODO


## Plugins & Processors

TODO
