import { BehaviorSubject } from 'rxjs'
import { subjectMolecule } from './rxjs/subjectMolecule.js'
import { type State, subjectAsState } from 'notcompose'
import * as console from 'node:console'

// --- Domain ---

interface User {
    username: string
    age: number
    score: number
}

// --- Input reactive state ---

const randomOf = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const delay = (ms: number) => new Promise(it => setTimeout(it, ms))

const randomUsername = () => randomOf('Tom Jack Max Leo Sam Ben Alex Luke Emma Mia Lily Ava Zoe Chloe Lucy'.split(' '))
const randomAge = () => randomNumber(1, 100)
const randomScore = () => randomNumber(1000, 1000000)

const usernameSubject = new BehaviorSubject(randomUsername())
const ageSubject = new BehaviorSubject(randomAge())
const scoreSubject = new BehaviorSubject(randomScore())

void (async () => {
    while (true) {
        await delay(randomNumber(500, 1500))
        usernameSubject.next(randomUsername())
    }
})()

void (async () => {
    while (true) {
        await delay(randomNumber(500, 1500))
        ageSubject.next(randomAge())
    }
})()

void (async () => {
    while (true) {
        await delay(randomNumber(500, 1500))
        scoreSubject.next(randomScore())
    }
})()

// --- Molecule ---

const user: BehaviorSubject<User> = subjectMolecule(() => {
    const username: State<string> = subjectAsState(usernameSubject)
    const age: State<number> = subjectAsState(ageSubject)
    const score: State<number> = subjectAsState(scoreSubject)

    const user: User = {
        username: username.value,
        age: age.value,
        score: score.value,
    }

    return user
})

// --- Demo ---

let valueCounter = 1
user.subscribe(user => {
    console.clear()
    console.log('------')
    console.log(`Value #${valueCounter++}`)
    console.log(`Username: ${user.username}`)
    console.log(`Age     : ${user.age}`)
    console.log(`Score   : ${user.score}`)
})
