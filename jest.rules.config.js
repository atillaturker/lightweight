/**
 * Jest config for the Firestore security rules suite. Runs in Node against
 * the Firestore emulator (see `npm run test:rules`), separately from the
 * app's jest-expo suite.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/firestore/**/*.emulator.ts'],
};
