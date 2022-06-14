const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

function override(config, env) {
  config.resolve.plugins = config.resolve.plugins.filter(p => !(p instanceof ModuleScopePlugin));
  return config;
}

module.exports = override;
