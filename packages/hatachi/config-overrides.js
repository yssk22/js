/* config-overrides.js */
const process = require('process');
const rewireYarnWorkspaces = require('react-app-rewire-yarn-workspaces');

module.exports = {
  webpack: function(config, env) {
    return rewireYarnWorkspaces(config, env);
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      proxy[0]['target'] = 'http://localhost:8080/';
      if (process.env['USE_PROD_API'] == '1') {
        proxy[0]['target'] = 'http://speedland-prod.appspot.com:8080/';
      }
      return configFunction(proxy);
    };
  }
};
