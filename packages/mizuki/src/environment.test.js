/* @flow */
import * as environment from './environment';

test('maybeDev', () => {
  expect(environment.maybeDev()).toBe(false);
});

test('maybeTest', () => {
  expect(environment.maybeTest()).toBe(true);
});
