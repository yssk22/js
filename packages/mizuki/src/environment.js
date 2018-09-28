/* @flow */
export type Platform = 'web' | 'node' | 'react-native' | 'unknown';
export type Environment = 'dev' | 'prod' | string;

export function getPlatform(): Platform {
  if (global.__DEV__) {
    return 'react-native';
  }
  if (global.window) {
    if (global.window.process) {
      return 'node';
    }
    if (global.window.document) {
      return 'web';
    }
  }
  return 'unknown';
}

export function maybeDev(): boolean {
  if (global.__DEV__) {
    return true;
  }
  if (maybeTest()) {
    return false;
  }
  if (global.window && global.window.document && global.window.document.hostname) {
    return global.window.document.hostname.startsWith('localhost');
  }
  return false;
}

export function maybeTest(): boolean {
  if (global.process) {
    for (let i = 0; i < global.process.argv.length; i++) {
      const v = global.process.argv[i];
      if (v.endsWith('/jest')) {
        return true;
      }
      if (v.endsWith('/jest.js')) {
        return true;
      }
      if (v.includes('node_modules/jest-worker')) {
        return true;
      }
    }
  }
  return false;
}
