/* @flow */

export function parseIntOr(val: string, or: number): number {
  const a = parseInt(val);
  if (isNaN(a)) {
    return or;
  }
  return a;
}

export function parseFloatOr(val: string, or: number): number {
  const a = parseFloat(val);
  if (isNaN(a)) {
    return or;
  }
  return a;
}
