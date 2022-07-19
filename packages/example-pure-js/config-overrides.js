const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = function override(config, env) {
  // Work around for Buffer is undefined:
  // https://github.com/webpack/changelog-v5/issues/10
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ];

  config.resolve = {
    ...config.resolve,
    fallback: {
      assert: false,
      url: false,
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      util: require.resolve('util'),
    },
  };

  // Ref: https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory
  config.resolve.plugins = config.resolve.plugins.filter(p => !(p instanceof ModuleScopePlugin));

  return config;
};
