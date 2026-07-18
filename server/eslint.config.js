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
      // Explicit return types — warn only, many are inferred correctly
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Allow any in catch clauses and service boundaries — Zod validates at runtime
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused variables are dead code — treat as error
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Floating promises are silent bugs — always handle them
      '@typescript-eslint/no-floating-promises': 'error',
      // Unsafe access rules — downgrade to warn (Zod/mongoose validate at runtime)
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    },
  },
  {
    files: ['**/*.test.ts', 'src/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
  },
);

