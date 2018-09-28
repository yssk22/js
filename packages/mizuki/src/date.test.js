/* @flow */
import * as date from './date';

test('toDateTimeString to return the date string with timezone offset', () => {
  expect(date.toDateTimeString(new Date('2018-01-15T18:00:00.000Z'), date.TimezoneOffset.JST)).toBe(
      '2018/01/16 03:00'
  );
});

test('toHumanDateString to return the human date', () => {
  expect(
      date.toHumanDateString(new Date('2018-01-15T01:00:00.000+0900'), date.TimezoneOffset.JST)
  ).toBe('2018/01/14');
  expect(
      date.toHumanDateString(new Date('2018-01-15T03:59:59.000+0900'), date.TimezoneOffset.JST)
  ).toBe('2018/01/14');
  expect(
      date.toHumanDateString(new Date('2018-01-15T04:00:00.000+0900'), date.TimezoneOffset.JST)
  ).toBe('2018/01/15');
});

test('toHumanTimeString to return the human time', () => {
  expect(
      date.toHumanTimeString(new Date('2018-01-15T01:00:00.000+0900'), date.TimezoneOffset.JST)
  ).toBe('25:00');
  expect(
      date.toHumanTimeString(new Date('2018-01-15T03:59:59.000+0900'), date.TimezoneOffset.JST)
  ).toBe('27:59');
  expect(
      date.toHumanTimeString(new Date('2018-01-15T04:00:00.000+0900'), date.TimezoneOffset.JST)
  ).toBe('04:00');
});

test('toHumanDateTimeString to return the human datetime', () => {
  expect(
      date.toHumanDateTimeString(new Date('2018-01-15T01:00:00.000+0900'), date.TimezoneOffset.JST)
  ).toBe('2018/01/14 25:00');
  expect(
      date.toHumanDateTimeString(new Date('2018-01-15T03:59:59.000+0900'), date.TimezoneOffset.JST)
  ).toBe('2018/01/14 27:59');
  expect(
      date.toHumanDateTimeString(new Date('2018-01-15T04:00:00.000+0900'), date.TimezoneOffset.JST)
  ).toBe('2018/01/15 04:00');
});
