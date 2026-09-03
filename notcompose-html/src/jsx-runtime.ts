export interface VNode {
    type: string | Function
    props: Record<string, unknown>
}

export function jsx(
    type: string | Function,
    props: Record<string, unknown>,
): VNode {
    return { type, props }
}

export const jsxs = jsx

export const Fragment = Symbol('Fragment')
