import { describe, expect } from 'vitest'
import { createModifierCollection, Modifier, ModifierCollection, type ModifierElement } from '../src/index.js'

describe('Test modifiers', () => {
    it('instanceof should work', () => {
        expect(Modifier instanceof Modifier).toBeTruthy()
        expect(Modifier instanceof MyModifier).toBeTruthy()
        expect(Modifier instanceof OtherModifier).toBeTruthy()
        expect(MyModifier instanceof Modifier).toBeTruthy()
        expect(MyModifier instanceof MyModifier).toBeTruthy()
        expect(MyModifier instanceof OtherModifier).toBeTruthy()
        expect(OtherModifier instanceof Modifier).toBeTruthy()
        expect(OtherModifier instanceof MyModifier).toBeTruthy()
        expect(OtherModifier instanceof OtherModifier).toBeTruthy()

        const modifier = Modifier.key('MY_KEY')
        expect(modifier.elements).toHaveLength(1)
        expect(modifier instanceof Modifier).toBeTruthy()
        expect(modifier instanceof MyModifier).toBeTruthy()
        expect(modifier instanceof OtherModifier).toBeTruthy()

        const myModifier = MyModifier.key('MY_KEY')
        expect(myModifier.elements).toHaveLength(1)
        expect(myModifier instanceof Modifier).toBeTruthy()
        expect(myModifier instanceof MyModifier).toBeTruthy()
        expect(myModifier instanceof OtherModifier).toBeTruthy()

        const myWrappedModifier = MyModifier(modifier)
        expect(myWrappedModifier.elements).toHaveLength(1)
        expect(myWrappedModifier instanceof Modifier).toBeTruthy()
        expect(myWrappedModifier instanceof MyModifier).toBeTruthy()
        expect(myWrappedModifier instanceof OtherModifier).toBeTruthy()

        const myWrappedModifierWithBackground = myWrappedModifier.background('red').key('ANOTHER_KEY')
        expect(myWrappedModifierWithBackground.elements).toHaveLength(3)
        expect(myWrappedModifierWithBackground instanceof Modifier).toBeTruthy()
        expect(myWrappedModifierWithBackground instanceof MyModifier).toBeTruthy()
        expect(myWrappedModifierWithBackground instanceof OtherModifier).toBeTruthy()

        expect({} instanceof Modifier).toBeFalsy()
        expect({} instanceof MyModifier).toBeFalsy()
        expect({} instanceof OtherModifier).toBeFalsy()
    })
})

class MyBackgroundModifier implements ModifierElement {
    constructor(public readonly color: string) {}
    equals(other: ModifierElement): boolean {
        return other instanceof MyBackgroundModifier && other.color === this.color
    }
}

class MyModifierCollection extends ModifierCollection {
    background(color: string): this {
        return this.then(new MyBackgroundModifier(color))
    }
}

class OtherModifierCollection extends ModifierCollection {}

const MyModifier = createModifierCollection(MyModifierCollection)

const OtherModifier = createModifierCollection(OtherModifierCollection)
