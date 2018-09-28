/* @flow */
import * as url from './url';

describe('UrlResolver', () => {
  const defaultResolver = url.default;
  const customResolver = new url.UrlResolver('http://www.example.com');
  test('resolve', () => {
    expect(defaultResolver.resolve('/aaa')).toBe('/aaa');
    expect(customResolver.resolve('/aaa')).toBe('http://www.example.com/aaa');
  });
  test('unresolve', () => {
    expect(defaultResolver.resolve('/aaa')).toBe('/aaa');
    expect(customResolver.unresolve('https://www.example.com/aaa')).toBe('/aaa');
    expect(customResolver.unresolve('https://www.example2.com/aaa')).toBe('/aaa');
  });
});

test('url.join', () => {
  expect(url.join('', 'b')).toBe('b');
  expect(url.join('', '/b/', '')).toBe('/b/');

  expect(url.join('a', 'b')).toBe('a/b');
  expect(url.join('/a', 'b')).toBe('/a/b');
  expect(url.join('/a/', 'b')).toBe('/a/b');
  expect(url.join('a/', 'b')).toBe('a/b');
  expect(url.join('a/', '/b')).toBe('a/b');
  expect(url.join('a/', 'b/')).toBe('a/b/');
});

test('url.normalizeSlash', () => {
  expect(url.normalizeSlash('foo')).toBe('/foo/');
  expect(url.normalizeSlash('bar/')).toBe('/bar/');
  expect(url.normalizeSlash('/hoge/')).toBe('/hoge/');
});
