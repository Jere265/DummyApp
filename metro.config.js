const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// No need for custom require or __dirname handling in CommonJS
// const { createRequire } = require('module');
// const { fileURLToPath } = require('url');
// const { dirname } = require('path');
// const require = createRequire(__filename);
// const __dirname = dirname(fileURLToPath(__filename));

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);