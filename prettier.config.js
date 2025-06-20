/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
export default {
    // Core formatting
    useTabs: true,
    tabWidth: 4,
    semi: false,
    singleQuote: true,

    // Trailing commas only when necessary (multi-line)
    trailingComma: 'es5',

    // Bracket spacing and newlines
    bracketSpacing: true,
    bracketSameLine: false,

    // Arrow functions
    arrowParens: 'avoid',

    // Print width
    printWidth: 100,

    // JSX specific
    jsxSingleQuote: true,

    // File specific overrides
    overrides: [
        {
            files: '*.json',
            options: {
                useTabs: false,
                tabWidth: 2,
            },
        },
        {
            files: '*.md',
            options: {
                useTabs: false,
                tabWidth: 2,
                printWidth: 80,
            },
        },
        {
            files: '*.yml,*.yaml',
            options: {
                useTabs: false,
                tabWidth: 2,
            },
        },
    ],
}
