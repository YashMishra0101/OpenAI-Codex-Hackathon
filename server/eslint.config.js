// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enforce explicit return types on public functions for readability
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      // Never use any — narrow the type or model the contract
      '@typescript-eslint/no-explicit-any': 'error',
      // Unused variables are dead code — treat as error
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Floating promises are silent bugs — always handle them
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
  },
);
