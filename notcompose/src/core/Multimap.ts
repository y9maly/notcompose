export class UnsafeMultimap<K, V> {
    private readonly value = new Map<K, Set<V>>()

    hasKey(key: K): boolean {
        return this.value.has(key)
    }

    has(key: K, value: V): boolean {
        const set = this.value.get(key)
        if (set === undefined) return false
        return set.has(value)
    }

    get(key: K): Set<V> | undefined {
        return this.value.get(key)
    }

    add(key: K, value: V) {
        let set = this.value.get(key)
        if (set === undefined) {
            set = new Set()
            this.value.set(key, set)
        }
        set.add(value)
    }

    /**
     * @return true if the element has been added, false if the element is already contained.
     */
    tryAdd(key: K, value: V): boolean {
        let set = this.value.get(key)
        if (set === undefined) {
            set = new Set()
            this.value.set(key, set)
        } else if (set.has(value)) {
            return false
        }
        set.add(value)
        return true
    }

    /**
     * @return true if an element existed and has been removed, or false if the element does not exist.
     */
    remove(key: K, value: V): boolean {
        const set = this.value.get(key)
        if (set === undefined) return false
        return set.delete(value)
    }
}
