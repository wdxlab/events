// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['prettier', 'import'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    es6: true,
    browser: true,
  },
  rules: {
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.spec.js'],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
      globals: {
        jest: true,
        nsObj: false,
      },
    },
  ],
};
