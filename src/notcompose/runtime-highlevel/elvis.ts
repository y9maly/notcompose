export function elvis<T extends object, R extends Partial<T>>(
    object: Partial<T> | undefined,
    recover: R,
): T | R {
   if (object === undefined)
       return recover

    const filteredA = Object.fromEntries(
        Object.entries(object).filter(([_, value]) => value !== undefined)
    )

    return { ...recover, ...filteredA }
}
