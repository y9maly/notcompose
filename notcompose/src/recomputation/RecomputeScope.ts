
export interface RecomputeScope {
    rememberPositional<T>(recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T
    rememberKeyed<T>(rememberKey: string | number | boolean, recomputeKeys: ReadonlyArray<unknown>, calculation: () => T): T
}
