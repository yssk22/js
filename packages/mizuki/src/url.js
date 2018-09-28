/* @flow */
import { URL } from 'url';

export const normalizeSlash = (path: string): string => {
  if (path[0] != '/') {
    path = `/${path}`;
  }
  if (path[path.length - 1] != '/') {
    path = `${path}/`;
  }
  return path;
};

export const join = (...paths: Array<?string>): string => {
  if (paths.length === 0) {
    return '';
  }
  let s: Array<string> = [];
  let first: ?string = undefined;
  let last: ?string = undefined;
  paths.forEach((v: ?string) => {
    if (v) {
      let v1 = v.replace(/^\/+|\/+$/g, '');
      if (v1 !== '') {
        s.push(v1);
        if (first === undefined) {
          first = v;
        }
        last = v;
      }
    }
  });
  let str = s.join('/');
  if (first && first.startsWith('/')) {
    str = `/${str}`;
  }
  if (last && last.endsWith('/')) {
    str = `${str}/`;
  }
  return str;
};

export class UrlResolver {
  _base: string;
  constructor(base: string = '') {
    this._base = base;
  }

  resolve(path: string): string {
    return join(this._base, path);
  }

  unresolve(url: string): string {
    const u = new URL(url);
    return u.pathname;
  }
}

export const defaultResolver = new UrlResolver();
