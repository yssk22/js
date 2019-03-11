/* config-overrides.js */
const process = require('process');
const rewireYarnWorkspaces = require('react-app-rewire-yarn-workspaces');

module.exports = {
  webpack: function(config, env) {
    return rewireYarnWorkspaces(config, env);
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      if (process.env['API_TARGET']) {
        console.log('using API target:', process.env['API_TARGET']);
        proxy[0]['target'] = process.env['API_TARGET'];
      }
      return configFunction(proxy);
    };
  }
};
