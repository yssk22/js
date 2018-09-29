/* @flow */
import { type APIError } from './APIError';

function mergeResource<T>(server: T, local: T): T {
  return (Object.assign(local, server): T);
}
function replaceResource<T>(server: T, local: T): T {
  return server;
}

function nopSuccessCallback<T>(v: T) {}
function nopFailureCallback(e: APIError) {}

export type AsyncRequestOptions<T> = {
  reduceResource: (T, T) => T,
  replaceCollection: boolean,
  onSuccess: (string | T) => void,
  onFailure: APIError => void
};

const DefaultRequestOptions: AsyncRequestOptions<any> = {
  reduceResource: replaceResource,
  replaceCollection: true,
  onSuccess: nopSuccessCallback,
  onFailure: nopFailureCallback
};

export function genOptions<T>(
  opts:
    | ?{
        reduceResource?: (T, T) => T,
        replaceCollection?: boolean,
        onSuccess?: (string | T) => void,
        onFailure?: APIError => void
      }
    | ?AsyncRequestOptions<T>
): AsyncRequestOptions<T> {
  return Object.assign({}, DefaultRequestOptions, opts);
}

export class AsyncActionRunner<T> {
  _options: AsyncRequestOptions<T>;
  _f: (AsyncRequestOptions<T>) => void;

  constructor(f: (AsyncRequestOptions<T>) => void) {
    this._f = f;
    this._options = Object.assign({}, DefaultRequestOptions);
  }

  reduceResource(reduce: 'replace' | 'merge' | ((T, T) => T)) {
    switch (reduce) {
      case 'replace':
        this._options.reduceResource = replaceResource;
        break;
      case 'merge':
        this._options.reduceResource = mergeResource;
        break;
      default:
        this._options.reduceResource = reduce;
    }
  }

  replaceCollection(replace: boolean) {
    this._options.replaceCollection = replace;
  }

  onSuccess(cb: (string | T) => void) {
    this._options.onSuccess = cb;
  }

  onFailure(cb: APIError => void) {
    this._options.onFailure = cb;
  }

  run() {
    this._f(this._options);
  }
}
