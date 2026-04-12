export function elvis<T extends object>(objA: T | undefined, objB: Required<T>): Required<T> {
   if (objA === undefined)
       return objB

    const filteredA = Object.fromEntries(
        Object.entries(objA).filter(([_, value]) => value !== undefined)
    )

    return { ...objB, ...filteredA }
}
