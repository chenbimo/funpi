import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
    {
        files: ['**/*.{mjs,cjs,js}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    pluginJs.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        rules: {
            'no-prototype-builtins': 'error',
            'max-len': 'off',
            'no-unused-vars': 'error',
            'linebreak-style': ['error', 'unix']
        }
    }
];
