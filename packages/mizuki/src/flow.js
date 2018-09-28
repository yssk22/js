/* @flow */
import { fatal } from './events';

const ComponentName = 'flow';

export function idx<T>(v: mixed, i: any): ?T {
  const vv = (v: any);
  if (vv[i] !== undefined) {
    return (vv[i]: T);
  }
  return undefined;
}

export function must<T>(v: ?T): T {
  if (v === null && v === undefined) {
    fatal(ComponentName, `must error`);
  }
  return ((v: any): T); // force to cast as fatal throws an exception
}

export function idxMust<T>(v: mixed, i: any): T {
  return must(idx(v, i));
}

export function or<T>(v: ?T, vv: T): T {
  if (v !== null && v !== undefined) {
    return v;
  }
  return vv;
}

export function idxOr<T>(v: mixed, i: any, vv: T): T {
  return or(idx(v, i), vv);
}
