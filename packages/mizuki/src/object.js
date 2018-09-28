/* @flow */
export function deepCopy(obj: any): any {
  if (obj === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(obj));
}

export function shallowCopy(obj: any): any {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return Object.assign([], obj);
    }
    return Object.assign({}, obj);
  }
  return obj;
}

export function typeOf(obj: any): string {
  // [object XXXX]" => "XXXX"
  return Object.prototype.toString.call(obj).slice(8, -1);
}

export function isPrimitive(obj: any): boolean {
  const t = typeOf(obj);
  return t === 'String' || t === 'Number' || t === 'Boolean' || t === 'Null';
}

export function canDeepCopy(obj: any): boolean {
  const t = typeOf(obj);
  if (t === 'String' || t === 'Number' || t === 'Boolean' || t === 'Null') {
    return true;
  }
  if (t === 'Object' || t === 'Array') {
    let ok = true;
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        const tt = typeOf(obj[i]);
        if (tt === 'String' || tt === 'Number' || tt === 'Boolean' || tt === 'Null') {
          // skip
        } else if (tt === 'Object' || tt === 'Array') {
          ok = ok && canDeepCopy(obj[i]);
        } else {
          ok = false;
        }
        if (!ok) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}
