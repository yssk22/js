/* @flow */
import { environment } from '@yssk22/mizuki';

export type ResourceSettingsOption<T> = {
  createDraft?: (id: string) => T,
  createParams?: (v: T) => { [string]: string },
  validateDraft?: (v: T) => ?{ [string]: string },
  updateParams?: (v: T) => { [string]: string },
  validateResource?: (v: T) => ?{ [string]: string },
  getId?: (v: T) => string,
  collectionSortStrategy?: 'unshift' | 'push' | ((a: T, b: T) => number),
  collectionMaxSize?: number
};

type ResourceSettingsOptionStrict<T> = {
  createDraft: (id: string) => T,
  createParams: (v: T) => { [string]: string },
  validateDraft: (v: T) => ?{ [string]: string },
  updateParams: (v: T) => { [string]: string },
  validateResource: (v: T) => ?{ [string]: string },
  getId: (v: T) => string,
  collectionSortStrategy: 'unshift' | 'push' | ((a: T, b: T) => number),
  collectionMaxSize: number
};

function genDefaultOptions<T>(): ResourceSettingsOptionStrict<T> {
  return {
    createDraft: (id: string): any => {
      return {
        id: id
      };
    },
    createParams: (v: any) => {
      return v;
    },
    validateDraft: (v: any) => {
      return null;
    },
    updateParams: (v: any) => {
      return v;
    },
    validateResource: (v: any) => {
      return null;
    },
    getId: (v: any) => {
      return v.id;
    },
    collectionSortStrategy: 'push',
    collectionMaxSize: -1
  };
}

export class ResourceSettings<T> {
  _validateReducer: boolean;
  _collectionUrl: string;
  _options: ResourceSettingsOptionStrict<T>;

  constructor(url: string, options: ?ResourceSettingsOption<T>) {
    this._collectionUrl = url;
    this._options = Object.assign({}, genDefaultOptions(), options);
    this._validateReducer = environment.maybeDev() || environment.maybeTest();
  }

  validateReducer(t: boolean): ResourceSettings<T> {
    this._validateReducer = t;
    return this;
  }

  shouldValidateReducer(): boolean {
    return this._validateReducer;
  }

  getCollectionUrl(): string {
    return this._collectionUrl;
  }

  createDraft(id: string): T {
    return this._options.createDraft(id);
  }

  createParams(v: T): { [string]: string } {
    return this._options.createParams(v);
  }

  updateParams(v: T): { [string]: string } {
    return this._options.updateParams(v);
  }

  getId(v: T): string {
    return this._options.getId(v);
  }

  getCollectionSortStrategy(): 'unshift' | 'push' | ((a: T, b: T) => number) {
    return this._options.collectionSortStrategy;
  }

  getCollectionMaxSize(): number {
    return this._options.collectionMaxSize;
  }
}
