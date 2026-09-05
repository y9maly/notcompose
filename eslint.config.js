import antfu from '@antfu/eslint-config'
import { explicitAnyPlugin } from './eslint/explicit-any-plugin.ts'
import { singlelineImportsPlugin } from './eslint/singleline-imports-plugin.js'

export default antfu(
    {
        type: 'lib',
        plugins: {
            'singleline-imports': singlelineImportsPlugin,
            // see ./eslint/explicit-any-plugin.ts explanation
            'explicit-any': explicitAnyPlugin,
        },
        stylistic: {
            indent: 4,
            quotes: 'single',
            semi: false,
            braceStyle: '1tbs',
        },
        typescript: {
            tsconfigPath: 'tsconfig.json',
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*/*.config.ts', '*.config.ts', 'eslint/*.ts'],
                    defaultProject: 'tsconfig.json',
                },
            },
        },
        jsonc: false,
        markdown: false,
        yaml: false,
        ignores: [
            'dist-html-examples/**',
        ],
    },
    {
        name: 'notcompose/project-rules',
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            /// ------ Javascript ------

            // disallow multiline imports
            'singleline-imports/single-line-imports': 'error',

            /// ------ Typescript ------

            // allow @ts-ignore
            'ts/ban-ts-comment': 'off',
            // allow "Function" type
            // do not force to use (...) => T type
            // > const func: Function
            'ts/no-unsafe-function-type': 'off',
            // use explicit-any/ rules instead of ts/ rules
            'ts/no-unsafe-argument': 'off',
            'ts/no-unsafe-assignment': 'off',
            'ts/no-unsafe-call': 'off',
            'ts/no-unsafe-member-access': 'off',
            'ts/no-unsafe-return': 'off',
            'explicit-any/no-unsafe-argument': 'warn',
            'explicit-any/no-unsafe-assignment': 'warn',
            'explicit-any/no-unsafe-call': 'warn',
            'explicit-any/no-unsafe-member-access': 'off',
            'explicit-any/no-unsafe-return': 'warn',

            /// ------ Formatting ------

            // allow this:
            // > if (something) return
            'antfu/if-newline': 'off',
            // allow this:
            // > function something <T>()
            'style/type-generic-spacing': 'off',
            // allow this:
            // > function something ()
            'style/space-before-function-paren': 'off',
            // ...
            'style/space-infix-ops': 'off',
            'style/type-annotation-spacing': 'warn',
            'style/padded-blocks': 'off',
            'style/array-bracket-spacing': ['error', 'never'],
            'style/arrow-parens': ['off', 'as-needed'],
            'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
            'style/comma-dangle': ['off', 'always-multiline'],
            'style/eol-last': ['warn', 'always'],
            'style/function-call-argument-newline': ['off', 'consistent'],
            'style/indent': ['warn', 4, {
                SwitchCase: 1,
                VariableDeclarator: 1,
                outerIIFEBody: 1,
            }],
            'style/member-delimiter-style': ['off', {
                multiline: {
                    delimiter: 'none',
                    requireLast: false,
                },
                singleline: {
                    delimiter: 'comma',
                    requireLast: false,
                },
            }],
            'style/no-mixed-spaces-and-tabs': 'error',
            'style/no-mixed-operators': 'off',
            'style/no-multi-spaces': 'off',
            'style/no-multiple-empty-lines': ['off', { max: 3, maxBOF: 10, maxEOF: 10 }],
            'style/no-extra-parens': 'off',
            'style/no-tabs': 'error',
            'style/no-trailing-spaces': 'off',
            'style/object-curly-spacing': ['warn', 'always'],
            'style/operator-linebreak': [
                'warn',
                'after',
                {
                    overrides: {
                        '|': 'before',
                        '&': 'before',
                        '&&': 'before',
                        '||': 'before',
                        '??': 'before',
                        '?': 'before',
                        ':': 'before',
                        '=': 'after',
                    },
                },
            ],
            'style/max-statements-per-line': 'off',
            'style/multiline-ternary': 'off',
            'style/quotes': ['warn', 'single', { allowTemplateLiterals: 'always', avoidEscape: true }],
            'style/semi': ['warn', 'never'],

            /// ------ JSX ------

            'style/jsx-wrap-multilines': 'off',
            'style/jsx-closing-tag-location': 'off',
            'style/jsx-tag-spacing': 'off',
            'style/jsx-one-expression-per-line': 'off',

            /// ------ Other ------

            // Correctness and maintainability. These rules do not define formatting.
            // Both braced and unbraced single statements are idiomatic here.
            'curly': 'off',
            'eqeqeq': ['error', 'always'],
            'import/no-mutable-exports': 'off',
            'no-console': 'off',
            'no-debugger': 'error',
            'no-lone-blocks': 'off',
            'no-throw-literal': 'error',
            'no-unmodified-loop-condition': 'off',
            'no-unreachable': 'error',
            'no-var': 'error',
            'no-new': 'off',
            'node/prefer-global/process': 'off',
            'object-shorthand': 'off',
            'one-var': 'off',
            'prefer-const': 'warn',
            'prefer-template': 'off',
            'symbol-description': 'off',
            'unused-imports/no-unused-imports': 'off',
            'unused-imports/no-unused-vars': ['off', {
                args: 'after-used',
                argsIgnorePattern: '^_',
                caughtErrors: 'none',
                ignoreRestSiblings: true,
                vars: 'all',
                varsIgnorePattern: '^_',
            }],

            'ts/consistent-type-definitions': 'off',
            'ts/no-non-null-assertion': 'off',
            'ts/no-empty-object-type': 'off',
            'ts/no-explicit-any': 'off',
            'ts/no-misused-promises': 'error',
            'ts/no-redeclare': 'off',
            'ts/no-this-alias': 'off',
            'ts/no-unnecessary-type-assertion': 'warn',
            'ts/no-unused-expressions': 'off',
            'ts/no-use-before-define': 'off',
            'ts/consistent-type-imports': 'off',
            'ts/explicit-function-return-type': 'off',
            'ts/method-signature-style': 'off',
            'ts/promise-function-async': 'off',
            'ts/restrict-template-expressions': 'off',
            'ts/strict-boolean-expressions': 'off',

            'import/consistent-type-specifier-style': 'off',
            'jsdoc/no-multi-asterisks': 'off',
            'unicorn/escape-case': 'off',
            'unicorn/no-new-array': 'off',
            'unicorn/number-literal-case': 'off',
            'unicorn/prefer-number-properties': 'off',
            'unicorn/throw-new-error': 'off',

            // Keep source order meaningful; automatic sorting may reorder side effects.
            'perfectionist/sort-exports': 'off',
            'perfectionist/sort-imports': 'off',
            'perfectionist/sort-named-exports': 'off',
            'perfectionist/sort-named-imports': 'off',

            'antfu/consistent-chaining': 'off',
            'antfu/consistent-list-newline': 'off',
            'antfu/curly': 'off',
            'antfu/top-level-function': 'off',
            'test/prefer-lowercase-title': 'off',
        },
    },
    {
        name: 'notcompose/explicit-any-plugin',
        files: ['eslint/explicit-any-plugin.ts'],
        rules: {
            // This adapter necessarily handles arbitrary upstream rule payloads
            // and partial AST node-type switches.
            'ts/switch-exhaustiveness-check': 'off',
            'explicit-any/no-unsafe-argument': 'off',
            'explicit-any/no-unsafe-assignment': 'off',
            'explicit-any/no-unsafe-call': 'off',
            'explicit-any/no-unsafe-member-access': 'off',
            'explicit-any/no-unsafe-return': 'off',
        },
    },
    // {
    //     name: 'notcompose/no-testing-imports-in-src',
    //     files: ['**/src/**/*.ts'],
    //     rules: {
    //         'no-restricted-imports': ['error', {
    //             patterns: [
    //                 {
    //                     group: [
    //                         '@notcompose/testing-*',
    //                         '@notcompose/testing-*/**',
    //                     ],
    //                     message: `'notcompose-testing package can't be used in src/ folder.'`,
    //                 },
    //             ],
    //         }],
    //     },
    // },
    // {
    //     name: 'notcompose/tests',
    //     files: ['test/**/*.ts'],
    //     rules: {
    //         'no-console': 'off',
    //         'ts/dot-notation': 'off',
    //         'ts/no-explicit-any': 'off',
    //     },
    // },
)
