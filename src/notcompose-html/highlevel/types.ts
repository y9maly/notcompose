import { Modifier } from 'notcompose'

// todo i dont like omitting 'apply'
export type Options<OPTIONS extends object = object> = Omit<OPTIONS, 'modifier' | 'apply'> & { modifier?: Modifier, apply?: never }

export type Args<OPTIONS extends object = object> =
    object extends OPTIONS
        ? (
            | [options: Options<OPTIONS>, content?: () => void]
            | [content?: () => void]
        )
        : (
            | [options: Options<OPTIONS>, content?: () => void]
        )

export function contentOf(args: Args): (() => void) | undefined {
    if (args.length === 1 && typeof args[0] === 'function')
        return args[0]
    if (args.length === 2)
        return args[1]
    return undefined
}

export function modifierOf(options: Options): Modifier
export function modifierOf(args: Args): Modifier
export function modifierOf(a: Options | Args): Modifier {
    if (!Array.isArray(a))
        return (a as Options).modifier ?? Modifier
    if (a.length === 1 && typeof a[0] !== 'function')
        return a[0]?.modifier ?? Modifier
    if (a.length === 2)
        return a[0].modifier ?? Modifier
    return Modifier
}

export function optionsOf<OPTIONS extends object>(args: Args<OPTIONS>): object extends OPTIONS ? OPTIONS | undefined : OPTIONS {
    if (args.length === 0)
        // @ts-ignore
        return undefined

    if (args.length === 1) {
        if (typeof args[0] === 'function')
            // @ts-ignore
            return undefined
        else {
            const obj = {...args[0]}
            delete obj.modifier
            // @ts-ignore
            return obj
        }
    }

    const obj = {...args[0]}
    // @ts-ignore
    delete obj.modifier
    // @ts-ignore
    return obj
}
