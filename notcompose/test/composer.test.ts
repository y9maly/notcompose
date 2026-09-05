import { Composer, currentComposerOrNull, setCurrentComposerUnsafe, withComposer } from '@notcompose/core'

describe('Composer tests', () => {
    it('currentComposer() works', () => {
        expect(currentComposerOrNull()).toBe(null)
        const composer = new Composer([])
        setCurrentComposerUnsafe(composer)
        expect(currentComposerOrNull()).toBe(composer)
    })

    it('withComposer() works', () => {
        expect(currentComposerOrNull()).toBe(null)
        const composer = new Composer([])

        expect(withComposer(composer, () => {
            expect(currentComposerOrNull()).toBe(composer)
            return 123
        })).toBe(123)

        expect(currentComposerOrNull()).toBe(null)
    })
})

afterEach(() => setCurrentComposerUnsafe(null))
