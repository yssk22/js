/* @flow */
import * as flow from './flow';

type EnumArg<T> = {
  key: string,
  value: T,
  label: string
};

class EnumValue<T> {
  sym: Symbol;
  value: T;
  label: string;

  constructor(key: string, value: T, label: string) {
    this.sym = Symbol.for(key);
    this.value = value;
    this.label = label;
    Object.freeze(this);
  }

  toString(): string {
    return this.label;
  }

  valueOf(): any {
    return this.value;
  }
}

export default class Enum<T> {
  _values: Array<EnumValue<*>>;
  _valueMap: { [T]: EnumValue<T> };

  static fromArray(
    enums: Array<mixed>,
    options?: {
      key?: string,
      value?: string,
      label?: string
    }
  ): Enum<T> {
    options = Object.assign(
      {
        key: 'key',
        value: 'value',
        label: 'label'
      },
      options
    );
    const keyField = options.key;
    const valueField = options.value;
    const labelField = options.label;
    const enumArgs = enums.map(v => {
      const key = flow.must(flow.idx(v, keyField));
      const label = flow.must(flow.idx(v, labelField));
      const value = flow.idxOr(v, valueField, key);
      return ({
        key: key,
        value: value,
        label: label
      }: EnumArg<T>);
    });
    return new Enum(...enumArgs);
  }

  constructor(...enums: Array<EnumArg<T>>) {
    this._values = [];
    this._valueMap = {};
    enums.forEach(v => {
      const enumv = new EnumValue(v.key, flow.must(v.value), v.label);
      this._valueMap[v.value] = enumv;
      this._values.push(enumv);
      Object.defineProperty(this, v.key, {
        get: () => {
          return enumv;
        }
      });
    });
    Object.freeze(this);
  }

  values() {
    return this._values;
  }

  parse(v: T): EnumValue<T> {
    return flow.must(this._valueMap[v]);
  }
}
