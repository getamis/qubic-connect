const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

function override(config, env) {
  config.resolve.plugins = config.resolve.plugins.filter(p => !(p instanceof ModuleScopePlugin));

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );
  return config;
}

module.exports = override;
