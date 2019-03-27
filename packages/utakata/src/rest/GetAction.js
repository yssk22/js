/* @flow */
import { url, events } from '@yssk22/mizuki';
import request from './request';
import { type ActionDispatchArgs, ActionType } from './Action';
import { genAPIError, type APIError } from './APIError';
import { AsyncActionRunner, type AsyncRequestOptions } from './AsyncActionRunner';
import { ResourceSettings } from './ResourceSettings';
import {
  type ResourceStore,
  type ResourceErrors,
  ResourceStatusValues,
  updateByServer,
  findResource
} from './Store';

export type GetResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'getResources',
  targets: Array<string>,
  caller: GetAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type DoneGetResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'doneGetResources',
  caller: GetAction<T>,
  resources: Array<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type ErrorGetResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'errorGetResources',
  resourceErrors: ResourceErrors,
  caller: GetAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type GetCollectionDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'getCollection',
  caller: GetAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type DoneGetCollectionDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'doneGetCollection',
  caller: GetAction<T>,
  resources: Array<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type ErrorGetCollectionDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'errorGetCollection',
  error: APIError,
  caller: GetAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type GetActionDispatchArgs<T> =
  | GetResourcesDispatchArgs<T>
  | DoneGetResourcesDispatchArgs<T>
  | ErrorGetResourcesDispatchArgs<T>
  | GetCollectionDispatchArgs<T>
  | DoneGetCollectionDispatchArgs<T>
  | ErrorGetCollectionDispatchArgs<T>;

export class GetAction<T> {
  _dispatch: (GetActionDispatchArgs<T>) => void;

  constructor(dispatch: (GetActionDispatchArgs<T>) => void) {
    this._dispatch = dispatch;
  }

  getResources(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return new AsyncActionRunner((opts: AsyncRequestOptions<T>) => {
      this._dispatch({
        type: ActionType,
        command: 'getResources',
        targets: ids,
        settings: settings,
        caller: this,
        requestOptions: opts
      });
    });
  }

  static reduceGetResources(
    store: ResourceStore<T>,
    action: GetResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    const settings = action.settings;
    const caller = action.caller;
    (action.targets || []).forEach(id => {
      const uri = url.defaultResolver.resolve(url.join(settings.getCollectionUrl(), `${id}.json`));
      const req = action.requestOptions.urlQuery
        ? request.get(`${uri}?${action.requestOptions.urlQuery}`)
        : request.get(uri);
      req.end((err, res) => {
        err = genAPIError(err, res);
        if (err) {
          caller.errorGetResources(
            settings,
            [
              {
                id: id,
                error: err
              }
            ],
            action.requestOptions
          );
        } else {
          caller.doneGetResources(settings, [res.body], action.requestOptions);
        }
      });
      const found = findResource(store.data, store.dataIndex, id);
      if (found) {
        found.resource.__state.status = ResourceStatusValues.READING;
      }
    });
    return store;
  }

  doneGetResources(
    settings: ResourceSettings<T>,
    resources: Array<T>,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'doneGetResources',
      resources: resources,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceDoneGetResources(
    store: ResourceStore<T>,
    action: DoneGetResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    const updated = updateByServer(store, action.resources || [], action.settings);
    updated.forEach(action.requestOptions.onSuccess);
    return store;
  }

  errorGetResources(
    settings: ResourceSettings<T>,
    errors: ResourceErrors,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'errorGetResources',
      resourceErrors: errors,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceErrorGetResources(
    store: ResourceStore<T>,
    action: ErrorGetResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    const errors = action.resourceErrors || [];
    errors.forEach(e => {
      const id = e.id;
      const found = findResource(store.data, store.dataIndex, id);
      if (found) {
        found.resource.__state.status = ResourceStatusValues.NONE;
        found.resource.__state.error = e.error.toString();
        action.requestOptions.onFailure(e.error);
      }
    });
    return store;
  }

  getCollection(settings: ResourceSettings<T>): AsyncActionRunner<T> {
    return new AsyncActionRunner((opts: AsyncRequestOptions<T>) => {
      this._dispatch({
        type: ActionType,
        command: 'getCollection',
        settings: settings,
        caller: this,
        requestOptions: opts
      });
    });
  }

  static reduceGetCollection(
    store: ResourceStore<T>,
    action: GetCollectionDispatchArgs<T>
  ): ResourceStore<T> {
    const caller = action.caller;
    const settings = action.settings;
    const uri = url.defaultResolver.resolve(settings.getCollectionUrl());
    const req = action.requestOptions.urlQuery
      ? request.get(`${uri}?${action.requestOptions.urlQuery}`)
      : request.get(uri);
    req.end((err, res) => {
      err = genAPIError(err, res);
      if (err) {
        caller.errorGetCollection(settings, err, action.requestOptions);
      } else {
        if (!Array.isArray(res.body)) {
          events.fatal(
            '@yssk22/kagayaki/rest.GetCollection',
            'the endpoint does not return a collection of resources',
            {
              uri: uri,
              response: res.body
            }
          );
        }
        caller.doneGetCollection(settings, res.body, action.requestOptions);
      }
    });
    store.status = 'reading';
    return store;
  }

  doneGetCollection(
    settings: ResourceSettings<T>,
    resources: Array<T>,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'doneGetCollection',
      resources: resources,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceDoneGetCollection(
    store: ResourceStore<T>,
    action: DoneGetCollectionDispatchArgs<T>
  ): ResourceStore<T> {
    if (action.requestOptions.replaceCollection) {
      store.data = [];
      store.dataIndex = {};
    }
    const updates = updateByServer(store, action.resources || [], action.settings);
    store.status = 'none';
    store.error = null;
    updates.forEach(action.requestOptions.onSuccess);
    return store;
  }

  errorGetCollection(settings: ResourceSettings<T>, error: APIError, opts: AsyncRequestOptions<T>) {
    this._dispatch({
      type: ActionType,
      command: 'errorGetCollection',
      error: error,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceErrorGetCollection(
    store: ResourceStore<T>,
    action: ErrorGetCollectionDispatchArgs<T>
  ): ResourceStore<T> {
    store.status = 'none';
    store.error = action.error.toString();
    action.requestOptions.onFailure(action.error);
    return store;
  }
}
