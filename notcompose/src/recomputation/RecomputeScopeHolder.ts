import type { RecomputeScope } from './RecomputeScope.js'
import { outsideRecomputeScope, withRecomputeScope } from './currentRecomputeScope.js'
import { RememberObserver } from '../composerPlugins/rememberObserver/RememberObserver.js'

/**
 * This is a simple helper for managing your own recompute scope.
 * Automatically applies RememberObserver plugin.
 * Example:
 * ```ts
 * // don't forget to call `holder.dispose()`
 * const holder = new RecomputeScopeHolder()
 *
 * const searchInput = document.getElementById("product-search") as HTMLInputElement
 * const categorySelect = document.getElementById("product-category") as HTMLSelectElement
 * searchInput.addEventListener('input', () => {
 *     const results = older.withRecomputeScope(() => {
 *         return searchProducts(categorySelect.value, searchInput.value)
 *     })
 *     showResults(results)
 * })
 *
 * function searchProducts(category: ProductCategory, query: string): Product[] {
 *     const index = remember([category], () => createSearchIndex(category))
 *     return index.search(query)
 * }
 *
 * function createSearchIndex(category: ProductCategory): SearchIndex {
 *     // complex calculation
 * }
 * ```
 *
 * @privateRemarks todo Automatically applies RememberObserver plugin.
 * @privateRemarks todo add async/await usage notice somewhere
 */
export class RecomputeScopeHolder {
    private readonly scope = new HolderControlledRecomputeScope()

    // todo(naming): within?
    withRecomputeScope<T>(block: () => T): T {
        this.scope.start()
        return withRecomputeScope(this.scope, block)
    }

    clear() {
        this.scope.clear()
    }

    dispose() {
        this.clear()
    }
}

type Slot = { recomputeKeys: ReadonlyArray<unknown>, value: unknown }

class HolderControlledRecomputeScope implements RecomputeScope {
    private positionalIndex = 0
    private readonly positionalValues: Slot[] = []
    private readonly keyedValues = new Map<string | number | boolean, Slot>()

    rememberPositional<T>(recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        if (this.isLeaved)
            throw new Error('You cannot remember values here because this recomputeScope is leaved')

        const currentIndex = this.positionalIndex++
        if (this.positionalValues.length > currentIndex) {
            const { recomputeKeys: previousRecomputeKeys, value: previousValue } = this.positionalValues[currentIndex]
            const needRecompute = recomputeKeys.length !== previousRecomputeKeys.length
                || recomputeKeys.some((it, index) => !Object.is(it, previousRecomputeKeys[index]))

            if (needRecompute) {
                const newValue = outsideRecomputeScope(calculation)
                RememberObserver.of(previousValue)?.onForgotten()
                RememberObserver.of(newValue)?.onRemembered()
                this.positionalValues[currentIndex] = { recomputeKeys, value: newValue }
                return newValue
            } else {
                return previousValue as T
            }
        }

        const value = outsideRecomputeScope(calculation)
        RememberObserver.of(value)?.onRemembered()
        this.positionalValues[currentIndex] = { recomputeKeys, value }
        return value
    }

    rememberKeyed<T>(rememberKey: string | number | boolean, recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T {
        if (this.isLeaved)
            throw new Error('You cannot remember values here because this recomputeScope is leaved')

        if (this.keyedValues.has(rememberKey)) {
            const { recomputeKeys: previousRecomputeKeys, value: previousValue } = this.keyedValues.get(rememberKey)!
            const needRecompute = recomputeKeys.length !== previousRecomputeKeys.length
                || recomputeKeys.some((it, index) => !Object.is(it, previousRecomputeKeys[index]))

            if (needRecompute) {
                const newValue = outsideRecomputeScope(calculation)
                RememberObserver.of(previousValue)?.onForgotten()
                RememberObserver.of(newValue)?.onRemembered()
                this.keyedValues.set(rememberKey, { recomputeKeys, value: newValue })
                return newValue
            } else {
                return previousValue as T
            }
        }

        const value = outsideRecomputeScope(calculation)
        RememberObserver.of(value)?.onRemembered()
        this.keyedValues.set(rememberKey, { recomputeKeys, value })
        return value
    }

    private leaves = 0
    private isLeaved = false

    leaveRecomputeScope(): void {
        this.leaves++
        this.isLeaved = true
    }

    reenterRecomputeScope(): void {
        if (!this.isLeaved)
            throw new Error(`'reenterRecomputeScope' can be called only after 'leaveRecomputeScope'`)
        this.leaves--
        if (this.leaves === 0) {
            this.isLeaved = false
        }
    }

    start() {
        this.positionalIndex = 0
    }

    clear() {
        this.positionalValues.forEach(({ value }) => RememberObserver.of(value)?.onForgotten())
        this.keyedValues.forEach(({ value }) => RememberObserver.of(value)?.onForgotten())
        this.positionalValues.length = 0
        this.keyedValues.clear()
    }
}
