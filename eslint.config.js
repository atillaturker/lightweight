// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Reference-only legacy code and build output are never linted.
    ignores: ['dist/*', 'src/_legacy/*'],
  },
  {
    // Jest hoists `jest.mock` above imports, so tests declare mocks first
    // and mock factories must `require` their dependencies.
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', '__mocks__/**'],
    rules: {
      'import/first': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Node scripts and config files run outside the app bundle.
    files: ['scripts/**/*.js', '*.config.js', 'jest.*.js'],
    languageOptions: {
      globals: { __dirname: 'readonly', __filename: 'readonly' },
    },
  },
]);
