import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowTypedFunctionExpressions: true,
        },
      ],
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          groups: [['builtin', 'external'], 'internal', 'parent', 'sibling'],
          'newlines-between': 'always',
        },
      ],
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@bin', './bin'],
            ['@config', './config'],
            ['@start', './start'],

            ['@controllers', './app/controllers'],
            ['@core', './app/core'],
            ['@exceptions', './app/exceptions'],
            ['@middlewares', './app/middlewares'],
            ['@use-case', './app/use-case'],
            ['@validators', './app/validators'],
          ],
          extensions: ['.ts', '.js', '.json'],
        },
      },
    },
  },
  {
    ignores: [
      'node_modules',
      'build',
      'public',
      'eslint.config.js',
      '*.config.js',
    ],
  },
];
