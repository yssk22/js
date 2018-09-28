/* @flow */
import Enum from './Enum';

test('Enum', () => {
  const MyEnum = new Enum({ key: 'key1', value: 4, label: 'Enum Key' });
  const e = MyEnum.parse(4);
  expect(e.value).toBe(4);
  expect(e.label).toBe('Enum Key');
});

test('Enum with 0 value', () => {
  const MyEnum = new Enum({ key: 'key1', value: 0, label: 'Enum Key' });
  const e = MyEnum.parse(0);
  expect(e.value).toBe(0);
  expect(e.label).toBe('Enum Key');
});
