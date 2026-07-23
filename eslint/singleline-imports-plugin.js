export const singlelineImportsPlugin = {
    rules: {
        'single-line-imports': {
            meta: {
                type: 'layout',
                fixable: 'whitespace',
                schema: [],
                messages: {
                    multiline: 'Import declaration must be on a single line.',
                },
            },

            create(context) {
                return {
                    ImportDeclaration(node) {
                        if (node.loc.start.line === node.loc.end.line)
                            return

                        context.report({
                            node,
                            messageId: 'multiline',

                            fix(fixer) {
                                const sourceCode = context.sourceCode
                                const text = sourceCode.getText(node)

                                return fixer.replaceText(
                                    node,
                                    text.replace(/\s*\n\s*/g, ' '),
                                )
                            },
                        })
                    },
                }
            },
        },
    },
}
