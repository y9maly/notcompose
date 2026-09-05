# Что это?

Нууу я решил па приколу сделать что-то типа Jetpack Compose на JS.

В этом репозитории есть 3 основных пакета, предназначенные для использования:
- [@notcompose/terminal](notcompose-terminal) (Для Terminal UI)
- [@notcompose/html](notcompose-html) (Для декларативного построения DOM в браузере. Типа как React)
- [@notcompose/molecule](notcompose-molecule) (Не связан с UI. Позволяет декларативно создавать одно реактивное состояние из множества других)

Пакет [@notcompose/core](notcompose) является общим: он предоставляет базовую функциональность.
Он позволяет декларативно строить любые деревья, работать с любым реактивным состоянием.
Остальные пакеты просто расширяют его.

P.S. Это не попытка полностью скопировать Kotlin Compose: некоторые концепции отличаются, ну а с некоторыми в оригинальном Kotlin Compose я вообще даже не разбирался.

# Примеры

 * [rrtop (Исходный код)](examples-terminal/src/terminal/rrtop.ts)

   https://github.com/user-attachments/assets/2ec8a41f-9478-46f5-9834-4f2ed3fa9cb3

 * [cube (Исходный код)](examples-terminal/src/terminal/cube.ts)

   https://github.com/user-attachments/assets/310e8f20-f182-436a-971b-e7d1ae346556

# Больше примеров:

__Больше примеров и README по каждому пакету тут:__

- [@notcompose/terminal](notcompose-terminal) (Для Terminal UI)
- [@notcompose/html](notcompose-html) (Для декларативного построения DOM в браузере. Типа как React)
- [@notcompose/molecule](notcompose-molecule) (Не связан с UI. Позволяет декларативно создавать одно реактивное состояние из множества других)

# Как потестить самому?

## 1. Либо установить зависимость в свой проект

Для того, чтобы использовать пакет notcompose-terminal, установите:
`npm i @notcompose/core @notcompose/ui @notcompose/layout @notcompose/terminal`

Для того, чтобы использовать пакет notcompose-html, установите:
`npm i @notcompose/core @notcompose/ui @notcompose/html`

Для того, чтобы использовать пакет notcompose-molecule, установите:
`npm i @notcompose/core @notcompose/molecule`

P.S. Установить всё сразу и, например, рендерить terminal UI с помощью @notcompose/terminal, одновременно используя реактивное состояние создаваемое @notcompose/molecule, одновременно отображая это всё в браузере с помощью @notcompose/html - Можно)

## 2. Либо склонировать этот репозиторий

```
git clone https://github.com/y9maly/notcompose.git && cd notcompose
npm install -g pnpm
pnpm install

# Запуск тестов
pnpm run test

# Запуск примеров терминала
pnpm run example:rrtop
pnpm run example:cube
pnpm run example:counter
pnpm run example:fileExplorer
pnpm run main

# Запуск примеров html
pnpm run example:html
```

# Как назвать этот заголовок?

Я не знаю можно ли назвать это фреймворком, но формально это он. Поэтому дальше буду использовать это определение.

# Документация

__Дополнительная документация для каждого пакета:__
- [@notcompose/terminal](notcompose-terminal) (Для Terminal UI)
- [@notcompose/html](notcompose-html) (Для декларативного построения DOM в браузере. Типа как React)
- [@notcompose/molecule](notcompose-molecule) (Не связан с UI. Позволяет декларативно создавать одно реактивное состояние из множества других)

В описании ниже будет использоваться пакет @notcompose/terminal для отображения, но все эти концепции общие, ведь они предоставлены через [@notcompose/core](notcompose)

## Working with state

Так же, как и в Kotlin Compose, здесь есть State и MutableState.
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
Только чтение свойства [value] у объекта State<T> привязывает стейт к ноде.


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

remember работает так же, как в Kotlin Compose.

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

Key с уникальным ключом использовать обязательно для каждого ветвления (if, for-циклов и т. д.), иначе у фреймворка не будет способа узнать что во время рекомпозиции выполнилась другая ветка, и это может привести к Undefined Behaviour.

Функция input используется для обработки ввода с клавиатуры. Первый экран отслеживает нажатие пробела, а корневой отслеживает переключения экранов. Из лямбды-обработчика нужно вернуть true чтобы не вызывались следующие обработчики. Сначала вызываются обработчики родительских, а потом по очереди обработчики дочерних нод. То есть, если нажать "1" в этом примере, то обработчик в Screen1 даже не узнает об этом.

Если покликать пробел на экране 1, затем уйти на экран 2, а затем снова вернуться на экран 1 - то счётчик на экране 1 обнулится.

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

В этом примере каждую секунду (чуть больше секунды) будет обновляться переменная [date], так как ключ counter меняется каждую секунду.
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

 * `remember([globalCounter.value], () => mutableStateOf(0))` - ЭТО ОШИБКА. Так писать нельзя. Потому что объект State в таком случае будет пересоздан при изменении ключей, и фреймворк не сможет правильно обработать рекомпозицию. Объект State должен быть использован в композиции уникально, без пересоздания.

 * `rememberState([globalCounter.value], () => 0)` - Так писать можно. Функция rememberState работает по-другому, если ей передан список ключей: Она всегда сохраняет один и тот же инстанс State, но пересчитывает САМО значение когда ключи изменились - и изменяет state.value, не меняя сам инстанс объекта state.

 * В общем лучше всегда использовать rememberState

 * [remember] можно использовать ТОЛЬКО во время композиции. Поэтому в примерах выше, где стейт создавался за пределами композиции я использовал [mutableStateOf].

## Effects

### LaunchedEffect

LaunchedEffect запускает лямбду когда он вошёл в композицию.
Опционально принимает ключи и перезапускается когда ключи изменились.

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

Работает так же, как и LaunchedEffect, но из лямбды можно вернуть другую лямбду, которая вызовется при выходе этого DisposableEffect из композиции.
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

## Modifiers

Каждый элемент дерева - это нода. Modifier - это способ добавить к ноде какие-то свойства.
Каждый пакет предоставляет свои модификаторы, так что ознакомьтесь с документацией каждого пакета отдельно.

```typescript
// ❗ Используйте импорт из того пакета, который вы используете.
//    Например: чтобы вам были доступны модификаторы терминала, используйте `import { Modifier } from '@notcompose/terminal'`
//    Вам не будут доступны модификаторы терминала, если вы оставите `import { Modifier } from '@notcompose/core'`
import { Modifier } from '@notcompose/core'

// Это пустой модификатор. Он не добавляет к ноде никаких свойств.
const modifier: Modifier = Modifier

// Здесь добавлен модификатор, который добавляет к ноде ключ. Это может заменить функцию Key во многих случаях.
// Например вот этот код:
//     if (screenIsWide) {
//         Key('wide', () => {
//             WideWidget()
//         })
//     } else {
//         Key('compact', () => {
//             CompactWidget()
//         })
//     }
// Можно заменить на вот этот:
//     if (screenIsWide) {
//         WideWidget(Modifier.key('wide'))
//     } else {
//         CompactWidget(Modifier.key('compact'))
//     }
// Тут важно задать ключ нодам, так как между рекомпозициями код может входить то в одну ветку, то в другую.
const modifier: Modifier = Modifier.key('MY_KEY')

// Здесь добавлены 2 модификатора: Модификатор ключа и модификатор имени.
// На самом деле, любые модификаторы добавляются с помощью функции `.then()`, а то, что пишется сразу через точку - это просто синтаксический сахар.
// Вы можете написать любой свой модификатор, и добавлять его через функцию `.then()`. Да, это будет не так красиво. Хотя на самом деле вы сможете сделать также красиво... Поговорим об этом в разделе "Modifier Collection".
const modifier: Modifier = Modifier.key('MY_KEY').then(NameModifier('My node'))

import { Modifier as TerminalModifier } from '@notcompose/terminal'

// Здесь используются модификаторы из пакета @notcompose/terminal.
// 1. Модификатор ключа
// 2. Модификатор, устанавливающий ширину ноды на 8.
// 3. Модификатор, устанавливающий высоту ноды на 2.
// 4. Модификатор, смещающий ноду на 10 вправо.
// 5. Модификатор, который рисует фон для этой ноды - символ $
// В терминале мы увидим вот такой результат:
//           $$$$$$$$
//           $$$$$$$$
const modifier_first = TerminalModifier.key('MY_KEY').width(8).height(2).offsetX(10).background('$')

// 6. Модификатор, который рисует текст "hello" в области этой ноды в окне терминала
// В терминале мы увидим вот такой результат:
//         hello$$$
//         $$$$$$$$
const modifier_second = modifier_first.drawText('hello')
```

### Modifier Collection

@notcompose/terminal и @notcompose/html предоставляют свои собственные Modifier - Это как раз Modifier Collection, который содержит набор стандартных модификаторов.
```typescript
import { Modifier as CoreModifier, NameModifier } from '@notcompose/core'
import { Modifier as TerminalModifier } from '@notcompose/terminal'
import { Modifier as HtmlModifier } from '@notcompose/html'

CoreModifier.key('MY_KEY') // ✅: Базовый ModifierCollection поддерживает key
CoreModifier.then(NameModifier('My node')) // ✅: Любой Modifier поддерживает функцию .then для добавления любых кастомных модификаторов
CoreModifier.name('My node') // ❌: Базовый ModifierCollection не поддерживает имена
CoreModifier.drawText('hello') // ❌: Базовый ModifierCollection не поддерживает .drawText из пакета @notcompose/terminal

TerminalModifier.key('MY_KEY') // ✅: Modifier из терминала наследует все возможности базового
TerminalModifier.then(NameModifier('My node')) // ✅: Modifier из терминала наследует все возможности базового
TerminalModifier.drawText('hello') // ✅: Modifier из терминала поддерживает модификатор отрисовки текста
TerminalModifier.className('border-radius-3xl') // ❌: Modifier из терминала не поддерживает .className из пакета @notcompose/html

TerminalModifier.key('MY_KEY') // ✅: Modifier из html наследует все возможности базового
TerminalModifier.then(NameModifier('My node')) // ✅: Modifier из html наследует все возможности базового
TerminalModifier.className('border-radius-3xl') // ✅: Modifier из html поддерживает модификатор, который добавляет DOM-элементу ещё один class
TerminalModifier.drawText('hello') // ❌: Modifier из html не поддерживает .drawText из пакета @notcompose/terminal
```

Создать свой ModifierCollection можно. API пока не стабилен. Можно посмотреть исходный код и сделать себе также:
- [Исходный код Modifier из terminal](notcompose-terminal/src/TerminalModifier.ts)
- [Исходный код Modifier из html](notcompose-html/src/HtmlModifier.ts)

## Plugins & Processors

TODO
