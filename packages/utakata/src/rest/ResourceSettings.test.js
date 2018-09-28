/* @flow */
import { ResourceSettings } from './ResourceSettings';
type TestModel = {
  key: string,
  message?: string
};

describe('ResourceSettings', () => {
  test('custom ID', () => {
    const settings = new ResourceSettings('/tests/', {
      getId: (v: TestModel) => {
        return v.key;
      }
    });
    expect(
      settings.getId({
        key: 'foo'
      })
    ).toEqual('foo');
  });
});
