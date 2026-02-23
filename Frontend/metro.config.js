const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Keep Metro in-process to avoid worker spawn failures on restricted environments.
  maxWorkers: 1,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
