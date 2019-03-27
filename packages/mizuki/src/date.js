/* @flow */
import Enum from './Enum';

const HUMAN_DATE_SWITCH_HOUR: number = 4;
const INVALID_DATE_STRING = '-';
const DATE_STRING_REGEXP = /\d{4}\/\d{2}\/\d{2}/;

const isDate = (t: any): boolean => {
  return t && t.getFullYear;
};

const isInvalidDate = (t: Date): boolean => {
  return t.toString() === 'Invalid Date';
};

const n = (d: number): string => {
  if (d >= 10) {
    return '' + d;
  }
  return '0' + d;
};

const parseDate = (t: ?(Date | string)): Date => {
  if (t == null) {
    return new Date('Invalid Date'); // invalid
  }
  if (t instanceof Date) {
    return t;
  }
  return new Date(t);
};

const convertTimezone = (t: Date, timezoneOffset: ?number): Date => {
  if (timezoneOffset == null) {
    return t;
  }
  const diff = timezoneOffset - t.getTimezoneOffset();
  if (diff === 0) {
    return t;
  }
  return new Date(t.getTime() - diff * 60 * 1000);
};

const toDateString = (t: ?(Date | string), timezoneOffset: ?number): string => {
  t = parseDate(t);
  if (isInvalidDate(t)) {
    return INVALID_DATE_STRING;
  }
  t = convertTimezone(t, timezoneOffset);
  return `${t.getFullYear()}/${n(t.getMonth() + 1)}/${n(t.getDate())}`;
};

const toTimeString = (t: ?(Date | string), timezoneOffset: ?number): string => {
  t = parseDate(t);
  if (isInvalidDate(t)) {
    return INVALID_DATE_STRING;
  }
  t = convertTimezone(t, timezoneOffset);
  return `${n(t.getHours())}:${n(t.getMinutes())}`;
};

const toDateTimeString = (t: ?(Date | string), timezoneOffset: ?number): string => {
  t = parseDate(t);
  if (!t) {
    return INVALID_DATE_STRING;
  }
  return `${toDateString(t, timezoneOffset)} ${toTimeString(t, timezoneOffset)}`;
};

const toHumanDateString = (t: ?(Date | string), timezoneOffset: ?number): string => {
  t = parseDate(t);
  if (isInvalidDate(t)) {
    return INVALID_DATE_STRING;
  }
  t = convertTimezone(t, timezoneOffset);
  if (t.getHours() < HUMAN_DATE_SWITCH_HOUR) {
    return toDateString(new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1));
  }
  return toDateString(t);
};

const toHumanTimeString = (t: ?(Date | string), timezoneOffset: ?number): string => {
  t = parseDate(t);
  if (isInvalidDate(t)) {
    return INVALID_DATE_STRING;
  }
  t = convertTimezone(t, timezoneOffset);
  let hours = t.getHours();
  if (hours < HUMAN_DATE_SWITCH_HOUR) {
    hours += 24;
  }
  return `${n(hours)}:${n(t.getMinutes())}`;
};

const toHumanDateTimeString = (t: ?(Date | string), timezoneOffset: ?number): string => {
  t = parseDate(t);
  if (isInvalidDate(t)) {
    return INVALID_DATE_STRING;
  }
  return `${toHumanDateString(t, timezoneOffset)} ${toHumanTimeString(t, timezoneOffset)}`;
};

const TimezoneOffset = {
  JST: -9 * 60,
  UTC: 0
};

export type Weekday = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;

const WeekdayEnum = new Enum(
  { key: 'all', value: -1, label: '毎日' },
  { key: 'sun', value: 0, label: '日曜日' },
  { key: 'mon', value: 1, label: '月曜日' },
  { key: 'tue', value: 2, label: '火曜日' },
  { key: 'wed', value: 3, label: '水曜日' },
  { key: 'thu', value: 4, label: '木曜日' },
  { key: 'fri', value: 5, label: '金曜日' },
  { key: 'sat', value: 6, label: '土曜日' }
);

const getToday = (): Date => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

const getHumanToday = (): Date => {
  const t = new Date();
  if (t.getHours() < HUMAN_DATE_SWITCH_HOUR) {
    return new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1, HUMAN_DATE_SWITCH_HOUR);
  }
  return new Date(t.getFullYear(), t.getMonth(), t.getDate(), HUMAN_DATE_SWITCH_HOUR);
};

const getDate = (t: ?(Date | string)): Date => {
  t = parseDate(t);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

const getHumanDate = (t: ?(Date | string)): Date => {
  t = parseDate(t);
  if (t.getHours() < HUMAN_DATE_SWITCH_HOUR) {
    return new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1, HUMAN_DATE_SWITCH_HOUR);
  }
  return new Date(t.getFullYear(), t.getMonth(), t.getDate(), HUMAN_DATE_SWITCH_HOUR);
};

const getDateOffset = (t: Date): number => {
  return t.getTime() - (t.getTime() % (60 * 60 * 24 * 1000));
};

const getTimeOffset = (t: Date): number => {
  return t.getTime() % (60 * 60 * 24 * 1000);
};

const toQueryString = (t: ?(Date | string)): string => {
  const s = JSON.stringify(t);
  return s.substr(1, s.length - 2);
};

const isDateString = (t: string): boolean => {
  if (t.match(DATE_STRING_REGEXP)) {
    return true;
  }
  return false;
};

const countDays = (t1: ?(Date | string), t2: ?(Date | string)): number => {
  t1 = parseDate(t1);
  t2 = parseDate(t2);
  if (isInvalidDate(t1) || isInvalidDate(t2)) {
    return 0;
  }
  return Math.floor((t1.getTime() - t2.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export {
  TimezoneOffset,
  WeekdayEnum,
  toDateString,
  toTimeString,
  toDateTimeString,
  toHumanDateString,
  toHumanTimeString,
  toHumanDateTimeString,
  parseDate,
  countDays,
  getToday,
  getHumanToday,
  getDate,
  getHumanDate,
  getDateOffset,
  getTimeOffset,
  toQueryString,
  isDate,
  isDateString
};
