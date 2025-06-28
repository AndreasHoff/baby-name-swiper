import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Only focus on truly unused code - make everything else warnings
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          // Allow unused variables in development
          args: 'none',
        },
      ],
      'unused-imports/no-unused-imports': 'warn', // Changed from error to warning
      'unused-imports/no-unused-vars': 'off', // Disabled to avoid conflicts
      
      // Make everything else warnings or disabled
      'no-unused-vars': 'off',
      'no-console': 'off', // Allow console statements in development
      'no-debugger': 'warn', // Only warn about debugger
      'no-duplicate-imports': 'warn',
      'prefer-const': 'off',
      'no-var': 'warn',
      
      // React specific rules - make less strict
      'react-hooks/exhaustive-deps': 'off', // Too noisy for development
      
      // TypeScript - make very lenient
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in development
    },
  },
)
