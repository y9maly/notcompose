/**
 * We have 'ts/no-unsafe-argument' eslint rule, but I don't like it and created my own rules via plugin.
 *
 * Why I don't like it? See this short example:
 * ```ts
 * function something(stringA: string, stringB: string): void
 * function something(numberA: number, numberB: number): void
 * function something(a: string | number, b: string | number): void {
 *     // We have invariant here:
 *     // - Either both arguments are strings
 *     // - Either both arguments are numbers
 *     // So we exactly know:
 *     // - if first argument is string, so second one is string also
 *     // - if first argument is not string, so both arguments is numbers
 *     if (typeof a === 'string') {
 *         return somethingStrings(a, b as any)
 *     }
 *     return somethingNumbers(a as any, b as any)
 * }
 *
 * declare function somethingStrings(stringA: string, stringB: string): void
 * declare function somethingNumbers(numberA: number, numberB: number): void
 * ```
 *
 * This example works fine. But when we have 'ts/no-unsafe-argument' rule enabled we got three warnings here:
 * ```ts
 * function something(a: string | number, b: string | number): void {
 *     if (typeof a === 'string') {
 *         // ESLint: Unsafe argument of type `any` assigned to a parameter of type `string`. (ts/no-unsafe-argument)
 *         return somethingStrings(a, b as any)
 *     }
 *     // ESLint: Unsafe argument of type `any` assigned to a parameter of type `string`. (ts/no-unsafe-argument)
 *     // ESLint: Unsafe argument of type `any` assigned to a parameter of type `number`. (ts/no-unsafe-argument)
 *     return somethingNumbers(a as any, b as any)
 * }
 * ```
 *
 * But these warnings are useless! I know that I use 'any' here. I know that 'any' is escape hatch in type system. But I also know that I write this code correctly.
 * I don't want to turn my code into thoughangs of useless `eslint-disable-next-line` suppresses just for ceremony.
 *
 * But I don't to disable 'ts/no-unsafe-argument' because it is useful for infered types. For example:
 * ```ts
 * function plus5(value: number): number { return value + 5 }
 *
 * // We can't say what getValue returns unless we watch them signature.
 * // So 'value' has infered type.
 * // This type can be changed at any time in the future.
 * // Suppose that it returns 'number' now.
 * // If return type is changed to 'string' in the future, it's not a problem because we receice typescript error 'Argument of type string is not assignable to parameter of type number'.
 * // BUT If return type is changed to 'any' in the future, we don't receive any error in the future and function 'plus5' can receive not a number - so we got runtime type violation.
 * const value = getValue()
 *
 * console.log(plus5(value))
 * ```
 *
 * I want to say: 'as any' cast is already sufficent marker that I use 'any' here. But default 'ts/no-unsafe-argument' doesn't give me that.
 *
 * Sooo... This plugin fixes it!
 *
 * ```ts
 * const ANY: any = 123
 * const NUMBER: number = 123
 *
 * // ESLint: Unsafe assignment of an `any` value. (explicit-any/no-unsafe-assignment)
 * // // We get this warning because 'any' type for 'v1' is infered, and we don't explicitly say that we want use 'any' here.
 * const v1 = ANY
 * // Ok
 * // // We don't get warning here becaues we explicitly declare type 'any' here
 * const v2: any = ANY
 * // Ok
 * // // We don't get warning here becaues we explicitly declare type 'any' here
 * const v3 = NUMBER as any
 *
 * // Also we can use 'assertAny' function to declare that argument MUST be exactly 'any'.
 * // It useful if we want to ensure that we use 'any' type here (useful when we update library version, for example).
 * // It also guarantees that we WANT to use 'any' here.
 * // (It might look line some magic, but it works)
 *
 * // Argument of type 123 is not assignable to parameter of type never
 * // // We get warning here because NUMBER is not exacly 'any'
 * const v4 = assertAny(NUMBER)
 * // Ok
 * // // We don't get warning here because ANY is exactly 'any'
 * const v5 = assertAny(ANY)
 * // Ok
 * // // Inferred as 'any'. We don't get warning here because we explicitly say that we want to use 'any' here.
 * const v6 = assertAny(ANY)
 *
 * // ESLint: Unsafe assignment of an `any` value. (explicit-any/no-unsafe-assignment)
 * const something1 = ANY.something
 * // Ok
 * const something2 = assertAny(ANY).something
 * // Ok
 * const something3 = (NUMBER as any).something
 * ```
 */

import type { TSESTree } from '@typescript-eslint/utils'
import tsPlugin from '@typescript-eslint/eslint-plugin'

type Node = TSESTree.Node

type Report = {
    node: Node
    messageId?: string
    [key: string]: unknown
}

type UnsafeRuleName =
    | 'no-unsafe-assignment'
    | 'no-unsafe-argument'
    | 'no-unsafe-return'
    | 'no-unsafe-call'
    | 'no-unsafe-member-access'

/**
 * Does this TYPE syntax explicitly contain `any`?
 *
 * Matches:
 *
 * any
 * any[]
 * Array<any>
 * Foo<any>
 * [string, any]
 *
 * But doesn't accidentally match something like:
 *
 * { any: string }
 */
function typeContainsAny(value: unknown): boolean {
    if (value === null || typeof value !== 'object')
        return false

    const node = value as Record<string, unknown>

    if (node.type === 'TSAnyKeyword')
        return true

    for (const [key, child] of Object.entries(node)) {
        // `parent` would create a cycle.
        if (
            key === 'parent'
            || key === 'loc'
            || key === 'range'
        ) {
            continue
        }

        if (Array.isArray(child)) {
            if (child.some(typeContainsAny))
                return true
        } else if (typeContainsAny(child)) {
            return true
        }
    }

    return false
}

function hasExplicitAnyTypeAnnotation(
    node: Node | null | undefined,
): boolean {
    if (!node)
        return false

    const annotation = (
        node as Node & {
            typeAnnotation?: {
                typeAnnotation?: unknown
            }
        }
    ).typeAnnotation?.typeAnnotation

    return typeContainsAny(annotation)
}

/**
 * Was `any` explicitly introduced in THIS expression?
 *
 * Explicitness propagates through operations originating from that explicit
 * any expression:
 *
 * (x as any).foo
 * (x as any).foo()
 * new (x as any)()
 * await (x as Promise<any>)
 *
 * But it does NOT propagate through variables:
 *
 * const x = value as any
 * x.foo // not explicit anymore
 */
function hasExplicitAnyOrigin(
    node: Node | null | undefined,
): boolean {
    if (!node)
        return false

    switch (node.type) {
        case 'TSAsExpression':
        case 'TSTypeAssertion':
        case 'TSSatisfiesExpression':
            return typeContainsAny(node.typeAnnotation)

        // Transparent wrappers.
        case 'TSNonNullExpression':
        case 'ChainExpression':
            return hasExplicitAnyOrigin(node.expression)

        // The resulting value originates from the object/callee.
        case 'MemberExpression':
            return hasExplicitAnyOrigin(node.object)

        case 'CallExpression':
            if (
                node.callee.type === 'Identifier'
                && node.callee.name === 'assertAny'
            ) {
                return true
            }

            return hasExplicitAnyOrigin(node.callee)

        case 'NewExpression':
            return hasExplicitAnyOrigin(node.callee)

        case 'TaggedTemplateExpression':
            return hasExplicitAnyOrigin(node.tag)

        case 'AwaitExpression':
            return hasExplicitAnyOrigin(node.argument)

        case 'SequenceExpression':
            return hasExplicitAnyOrigin(node.expressions.at(-1))

        default:
            return false
    }
}

function findAssignmentBoundary(
    node: Node,
): Node | null {
    let current: Node | undefined = node

    while (current) {
        switch (current.type) {
            case 'VariableDeclarator':
            case 'AssignmentExpression':
            case 'AssignmentPattern':
            case 'PropertyDefinition':
            case 'AccessorProperty':
            case 'SpreadElement':
            case 'JSXAttribute':
                return current

            case 'Property':
                // In destructuring:
                //
                // const { x } = value
                //
                // Property isn't the assignment boundary.
                if (current.parent?.type !== 'ObjectPattern')
                    return current

                break
        }

        current = current.parent
    }

    return null
}

function isExplicitAnyAssignment(
    report: Report,
): boolean {
    const boundary = findAssignmentBoundary(report.node)

    if (!boundary)
        return false

    switch (boundary.type) {
        case 'VariableDeclarator':
            return (
                hasExplicitAnyOrigin(boundary.init)
                || hasExplicitAnyTypeAnnotation(boundary.id)
            )

        case 'AssignmentExpression':
            return hasExplicitAnyOrigin(boundary.right)

        case 'AssignmentPattern':
            return (
                hasExplicitAnyOrigin(boundary.right)
                || hasExplicitAnyTypeAnnotation(boundary.left)
            )

        case 'PropertyDefinition':
        case 'AccessorProperty':
            return (
                hasExplicitAnyOrigin(boundary.value)
                || hasExplicitAnyTypeAnnotation(boundary)
            )

        case 'Property':
            return hasExplicitAnyOrigin(boundary.value)

        case 'SpreadElement':
            return hasExplicitAnyOrigin(boundary.argument)

        case 'JSXAttribute': {
            const value = boundary.value

            if (
                value?.type !== 'JSXExpressionContainer'
                || value.expression.type === 'JSXEmptyExpression'
            ) {
                return false
            }

            return hasExplicitAnyOrigin(value.expression)
        }

        default:
            return false
    }
}

function isExplicitAnyArgument(
    report: Report,
): boolean {
    const node = report.node

    if (node.type === 'SpreadElement')
        return hasExplicitAnyOrigin(node.argument)

    return hasExplicitAnyOrigin(node)
}

function isExplicitAnyReturn(
    report: Report,
): boolean {
    const node = report.node

    if (
        node.type === 'ReturnStatement'
        && hasExplicitAnyOrigin(node.argument)
    ) {
        return true
    }

    if (
        node.type !== 'ReturnStatement'
        && hasExplicitAnyOrigin(node)
    ) {
        return true
    }

    let current: Node | undefined = node

    while (current) {
        switch (current.type) {
            case 'ArrowFunctionExpression':
            case 'FunctionExpression':
            case 'FunctionDeclaration': {
                if (typeContainsAny(current.returnType))
                    return true

                const parent = current.parent

                if (
                    parent?.type === 'VariableDeclarator'
                    && hasExplicitAnyTypeAnnotation(parent.id)
                ) {
                    return true
                }

                if (
                    parent?.type === 'TSAsExpression'
                    || parent?.type === 'TSTypeAssertion'
                    || parent?.type === 'TSSatisfiesExpression'
                ) {
                    return typeContainsAny(parent.typeAnnotation)
                }

                return false
            }

            default:
                current = current.parent
        }
    }

    return false
}

function isExplicitAnyCall(
    report: Report,
): boolean {
    const node = report.node

    if (node.type === 'NewExpression')
        return hasExplicitAnyOrigin(node.callee)

    // no-unsafe-call reports on callee/tag itself.
    return hasExplicitAnyOrigin(node)
}

function isExplicitAnyMemberAccess(
    report: Report,
): boolean {
    const node = report.node

    // obj[key as any]
    if (report.messageId === 'unsafeComputedMemberAccess')
        return hasExplicitAnyOrigin(node)

    // (obj as any).foo
    const member = node.parent

    if (member?.type !== 'MemberExpression')
        return false

    return hasExplicitAnyOrigin(member.object)
}

function wrapRule(
    name: UnsafeRuleName,
    shouldSuppress: (report: Report) => boolean,
) {
    // The public eslint-plugin exports its rule objects.
    const original = tsPlugin.rules[name] as any

    if (!original)
        throw new Error(`typescript-eslint rule not found: ${name}`)

    return {
        ...original,

        create(context: any) {
            const wrappedContext = Object.create(context)

            Object.defineProperty(wrappedContext, 'report', {
                configurable: true,
                enumerable: true,
                value(report: Report) {
                    if (!shouldSuppress(report))
                        context.report(report)
                },
            })

            return original.create(wrappedContext)
        },
    }
}

export const explicitAnyPlugin = {
    rules: {
        'no-unsafe-assignment': wrapRule(
            'no-unsafe-assignment',
            isExplicitAnyAssignment,
        ),

        'no-unsafe-argument': wrapRule(
            'no-unsafe-argument',
            isExplicitAnyArgument,
        ),

        'no-unsafe-return': wrapRule(
            'no-unsafe-return',
            isExplicitAnyReturn,
        ),

        'no-unsafe-call': wrapRule(
            'no-unsafe-call',
            isExplicitAnyCall,
        ),

        'no-unsafe-member-access': wrapRule(
            'no-unsafe-member-access',
            isExplicitAnyMemberAccess,
        ),
    },
}
