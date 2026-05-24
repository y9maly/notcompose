
# Molecule demo

Вдохновлено https://github.com/cashapp/molecule .

Это демонтрация того, что notcompose фремворк может быть не только TUI фреймворком.
Он позволяет строить любые деревья, которые могут рекомпозироваться (вычисляться заново) при смене состояния.
- notcompose-terminal является лишь расширением notcompose.
- notcompose-molecule позволяет описывать выходную модель как функцию от реактивных состояний, а не вручную собирать граф.

В этом примере используется библиотека rxjs.

[demo.ts](demo.ts)
```typescript
// Допустим у нас есть вот такие реактивные состояния:
const usernameSubject: BehaviorSubject<string>
const ageSubject: BehaviorSubject<number>
const scoreSubject: BehaviorSubject<number>

// И вот такой интерфейс пользователя:
interface User {
    username: string
    info: UserInfo
}

interface UserInfo {
    age: number
    score: number
}

// Мы хотим объеденить эти 3 состояния и получить BehaviourSubject<User>
const userSubject: BehaviorSubject<User>

// С notcompose-molecule это можно сделать так:
const userSubject: BehaviorSubject<User> = subjectMolecule<User>(() => {
    // subjectAsState преобразует BehaviorSubject в объект State, который фреймворк notcompose умеет отслеживать сам.
    const username: State<string> = subjectAsState(usernameSubject)
    const age: State<number> = subjectAsState(ageSubject)
    const score: State<number> = subjectAsState(scoreSubject)

    // За счёт того, что мы вызываем свойство value ЗДЕСЬ, фреймворк понимает что текущая функция
    // зависит от стейта. И перезапускает её.
    return {
        username: username.value,
        info: {
            age: age.value,
            score: score.value,
        } satisfies UserInfo
    } satisfies User
})

// Использование
let valueCounter = 1 // Счётчик покажет, как часто обновляется userSubject
userSubject.subscribe(user => {
    console.clear()
    console.log('------')
    console.log(`Value #${valueCounter++}`)
    console.log(`Username: ${user.username}`)
    console.log(`Age     : ${user.info.age}`)
    console.log(`Score   : ${user.info.score}`)
})
```

https://github.com/user-attachments/assets/a8a98628-bbeb-4301-8927-5f6e7b4f044f

Этот способ масштабируется на достаточно сложные и вложенные объекты.

## Effects!

Вы можете использовать функции Key, remember, rememberState, LaunchedEffect, DisposableEffect, потому-что они находятся в [ядре notcompose](/src/notcompose/runtime-highlevel), и не привязаны к [notcompose-terminal](/src/notcompose-terminal)

P.S. DisposableEffect это аналог useEffect в React. remember это аналог useMemo в React. rememberState это аналог useState в React.

```typescript
const user: BehaviorSubject<User> = subjectMolecule(() => {
    const username: State<string> = subjectAsState(usernameSubject)
    const age: State<number> = subjectAsState(ageSubject)
    const score: State<number> = subjectAsState(scoreSubject)
    const extraAge: MutableState<number> = rememberState(() => 0)
    
    if (username.value === 'Tom' || username.value === 'Mia') {
        // Запускаем DisposableEffect только если текущее имя это Tom или Mia
        DisposableEffect(() => {
            const interval = setInterval(() => {
                extraAge.value++
            }, 50)

            return () => clearInterval(interval)
        })
    } else {
        // Иначе сбрасываем extraAge
        extraAge.value = 0
    }

    // В итоге получится, что пока username это Tom либо Mia, каждые 50мс к возрасту добавляется 1.
    const user: User = {
        username: username.value,
        age: age.value + extraAge.value,
        score: score.value,
    }

    return user
})
```

// TODO

## complexExample

Более сложный пример есть в следующих файлах: (Пример сгенерирован нейронкой, у меня нет времени сейчас думать, там много букав, но разница в удобстве видна хорошо)
- [complexDemo.ts](complexDemo.ts)
- [complexDemo-rxjs.ts](complexDemo-rxjs.ts)
- [complexDemo-molecule.ts](complexDemo-molecule.ts)
