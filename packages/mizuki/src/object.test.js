/* @flow */
import * as object from './object';

describe('deepCopy', () => {
  test('object', () => {
    const obj = {
      foo: {
        bar: {
          hoge: 'fuga'
        }
      }
    };
    const copy = object.deepCopy(obj);
    expect(copy).toEqual(obj);
    copy.foo.bar.hoge = 'xxx';
    expect(obj.foo.bar.hoge).toBe('fuga');
  });
  test('array', () => {
    const obj = [{ foo: { bar: { hoge: 'fuga' } } }];
    const copy = object.deepCopy(obj);
    expect(copy).toEqual(obj);
    copy[0].foo.bar.hoge = 'xxx';
    expect(obj[0].foo.bar.hoge).toBe('fuga');
  });
});

describe('canDeepCopy', () => {
  test('primitive', () => {
    expect(object.canDeepCopy('123')).toBe(true);
    expect(object.canDeepCopy(123)).toBe(true);
    expect(object.canDeepCopy(new Date())).toBe(false);
  });
  test('object', () => {
    const obj = {
      foo: {
        bar: {
          hoge: 'fuga'
        }
      }
    };
    expect(object.canDeepCopy(obj)).toBe(true);
  });

  test('object with date', () => {
    const obj = {
      foo: {
        bar: {
          hoge: new Date()
        }
      }
    };
    expect(object.canDeepCopy(obj)).toBe(false);
  });

  test('array', () => {
    const obj = [{ foo: { bar: { hoge: 'fuga' } } }];
    expect(object.canDeepCopy(obj)).toBe(true);
  });

  test('array with date', () => {
    const obj = [{ foo: { bar: { hoge: new Date() } } }];
    expect(object.canDeepCopy(obj)).toBe(false);
  });
});

describe('shallowCopy', () => {
  test('object', () => {
    const obj = {
      foo: {
        bar: {
          hoge: 'fuga'
        }
      }
    };
    const copy = object.shallowCopy(obj);
    expect(copy).toEqual(obj);
    copy.add = 'foo';
    copy.foo.bar.hoge = 'xxx';
    expect((obj: any).add).toBe(undefined);
    expect(obj.foo.bar.hoge).toBe('xxx'); // nested object is shared with the original
  });
  test('array', () => {
    const obj = [{ foo: { bar: { hoge: 'fuga' } } }];
    const copy = object.shallowCopy(obj);
    expect(copy).toEqual(obj);
    copy[0].foo.bar.hoge = 'xxx';
    copy.push({});
    expect(copy.length).toBe(2);
    expect(obj.length).toBe(1);
    expect(obj[0].foo.bar.hoge).toBe('xxx'); // nested object is shared with the original
  });
});
