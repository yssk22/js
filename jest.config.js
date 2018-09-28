const fs = require('fs');
const path = require('path');
let config = {
  verbose: true,
  transform: {
    '^.+\\.(js)$': './jest.transform.js'
  },
  testURL: 'http://localhost',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/speedland/'],
  globals: {
    window: {}
  }
};
const localConfigPath = path.resolve('./jest.config.local.js');
if (fs.existsSync(localConfigPath)) {
  config = Object.assign({}, config, require(localConfigPath));
}

module.exports = config;
