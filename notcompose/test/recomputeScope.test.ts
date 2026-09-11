import { describe, expect } from 'vitest'
import { RecomputeScopeHolder } from '../src/recomputation/RecomputeScopeHolder.js'
import { currentRecomputeScope, currentRecomputeScopeOrNull, DisposableEffect, LaunchedEffect, remember } from '../src/index.js'

describe('recomputeScope tests', () => {
    it('remember creates their own RecomputeScope', () => {
        const outerHolder = new RecomputeScopeHolder()

        function Invoke() {
            const outerRecomputeScope = currentRecomputeScope()
            const innerRecomputeScope = remember(() => currentRecomputeScope())
            expect(innerRecomputeScope).not.toBe(outerRecomputeScope)
        }

        outerHolder.withRecomputeScope(Invoke)
    })

    it('LaunchedEffect/DisposableEffect creates their own RecomputeScope', () => {
        const outerHolder = new RecomputeScopeHolder()

        function Invoke() {
            const outerRecomputeScope = currentRecomputeScope()

            LaunchedEffect(() => {
                const launchedEffectScope = currentRecomputeScope()
                expect(launchedEffectScope).not.toBe(outerRecomputeScope)
            })

            DisposableEffect(() => {
                const launchedEffectScope = currentRecomputeScope()
                expect(launchedEffectScope).not.toBe(outerRecomputeScope)
                return () => {
                    expect(currentRecomputeScopeOrNull()).toBeNull()
                }
            })
        }

        outerHolder.withRecomputeScope(Invoke)
    })

    it('remember inside remember', () => {
        const outerHolder = new RecomputeScopeHolder()
        const events: string[] = []
        let outerKey = 1
        let innerKey = 1

        function Invoke() {
            events.push('Invoke')

            remember([outerKey], () => {
                events.push('Outer remember calculation')
                remember([innerKey], () => {
                    events.push('Inner remember calculation')
                })
            })
        }

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Outer remember calculation', 'Inner remember calculation'])
        events.length = 0

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        outerKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Outer remember calculation'])
        events.length = 0

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        innerKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        outerKey++
        innerKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Outer remember calculation', 'Inner remember calculation'])
        events.length = 0
    })

    it('remember inside effect', () => {
        const outerHolder = new RecomputeScopeHolder()
        const events: string[] = []
        let effectKey = 0
        let rememberKey = 0

        function Invoke() {
            events.push('Invoke')
            DisposableEffect([effectKey], () => {
                events.push('Effect launched')
                remember([rememberKey], () => {
                    events.push('Remember calculation')
                })
                return () => events.push('Effect disposed')
            })
        }

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Effect launched', 'Remember calculation'])
        events.length = 0

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        effectKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Effect disposed', 'Effect launched'])
        events.length = 0

        rememberKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        effectKey++
        rememberKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Effect disposed', 'Effect launched', 'Remember calculation'])
        events.length = 0
    })

    it('effect inside remember', () => {
        const outerHolder = new RecomputeScopeHolder()
        const events: string[] = []
        let rememberKey = 0
        let effectKey = 0

        function Invoke() {
            events.push('Invoke')
            remember([rememberKey], () => {
                events.push('Remember calculation')
                DisposableEffect([effectKey], () => {
                    events.push('Effect launched')
                    return () => events.push('Effect disposed')
                })
            })
        }

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Remember calculation', 'Effect launched'])
        events.length = 0

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        rememberKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Remember calculation'])
        events.length = 0

        effectKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        rememberKey++
        effectKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Remember calculation', 'Effect disposed', 'Effect launched'])
        events.length = 0
    })

    it('effect inside effect', () => {
        const outerHolder = new RecomputeScopeHolder()
        const events: string[] = []
        let outerKey = 0
        let innerKey = 0

        function Invoke() {
            events.push('Invoke')
            DisposableEffect([outerKey], () => {
                events.push('Outer effect launched')
                DisposableEffect([innerKey], () => {
                    events.push('Inner effect launched')
                    return () => events.push('Inner effect disposed')
                })
                return () => events.push('Outer effect disposed')
            })
        }

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Outer effect launched', 'Inner effect launched'])
        events.length = 0

        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        outerKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Outer effect disposed', 'Outer effect launched'])
        events.length = 0

        innerKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke'])
        events.length = 0

        outerKey++
        innerKey++
        outerHolder.withRecomputeScope(Invoke)
        expect(events).toEqual(['Invoke', 'Outer effect disposed', 'Outer effect launched', 'Inner effect disposed', 'Inner effect launched'])
        events.length = 0
    })
})
