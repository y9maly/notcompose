
# Molecule demo

Вдохновлено https://github.com/cashapp/molecule .

Это демонтрация того, что notcompose фремворк может быть не только TUI фреймворком.
Он позволяет строить любые деревья, которые могут рекомпозироваться (вычисляться заново) при смене состояния.
- notcompose-terminal является лишь расширением notcompose.
- notcompose-molecule позволяет описывать выходную модель как функцию от реактивных состояний, а не вручную собирать граф.

В этом примере используется библиотека rxjs.

Более сложный пример есть в файлах (Пример сгенерирован нейронкой, у меня нет времени сейчас думать, там много букав, но разница в удобстве видна хорошо):
- [complexDemo.ts](complexDemo.ts)
- [complexDemo-rxjs.ts](complexDemo-rxjs.ts)
- [complexDemo-molecule.ts](complexDemo-molecule.ts)

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
const user: BehaviorSubject<User>

// С notcompose-molecule это можно сделать так:
const user = subjectMolecule<User>(() => {
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
```

Этот способ масштабируется на достаточно сложные и вложенные объекты.
