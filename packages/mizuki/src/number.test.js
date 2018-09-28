/* @flow */
import * as number from './number';

test('parseIntOr', () => {
  expect(number.parseIntOr('a', 1)).toBe(1);
  expect(number.parseIntOr('10', 1)).toBe(10);
});

test('parseFloatOr', () => {
  expect(number.parseFloatOr('a', 1)).toBe(1);
  expect(number.parseFloatOr('10.5', 1)).toBe(10.5);
});
