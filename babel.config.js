module.exports = function (api) {
  api.cache(true);

  // Under Jest, React Native's own mocks (react-native/jest/mockComponent.js)
  // read `RealComponent.prototype.constructor`. In RN 0.81 several built-ins
  // (e.g. Libraries/Text/Text) are declared with the Flow `component(...)`
  // syntax, which babel-preset-expo lowers to a plain *arrow* function — and
  // arrow functions have no `prototype`, so the mock throws
  // "Cannot read properties of undefined (reading 'constructor')". Hermes does
  // not need arrow functions transformed, so the preset omits this on native;
  // we add it back for the Jest run only.
  const isJest = Boolean(process.env.JEST_WORKER_ID);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-worklets/plugin", // Reanimated 4.x
      ...(isJest ? ["@babel/plugin-transform-arrow-functions"] : []),
    ],
  };
};
