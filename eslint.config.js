import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    { ignores: ['**/components/ui', '**/src-tauri', 'dist/**', 'build/**'] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        settings: {
            react: {
                version: 'detect'
            }
        }
    },
    pluginReact.configs.flat.recommended,
    eslintConfigPrettier,
    {
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off', // Disable prop-types for TypeScript projects
            'react/no-unknown-property': [
                'error',
                {
                    ignore: ['args', 'object', 'attach'] // React Three Fiber props
                }
            ]
        }
    }
]
