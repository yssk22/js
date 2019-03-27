/* @flow */
import { url } from '@yssk22/mizuki';
import request from './request';
import { type ActionDispatchArgs, ActionType } from './Action';
import { genAPIError } from './APIError';
import { AsyncActionRunner, type AsyncRequestOptions } from './AsyncActionRunner';
import { ResourceSettings } from './ResourceSettings';
import {
  type ResourceStore,
  type ResourceErrors,
  ResourceStatusValues,
  deleteResources,
  rebuildIndexes,
  findResource
} from './Store';

export type DeleteResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'deleteResources',
  targets: Array<string>,
  caller: DeleteAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type DoneDeleteResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'doneDeleteResources',
  caller: DeleteAction<T>,
  targets: Array<string>,
  requestOptions: AsyncRequestOptions<T>
};

export type ErrorDeleteResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'errorDeleteResources',
  resourceErrors: ResourceErrors,
  caller: DeleteAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type DeleteActionDispatchArgs<T> =
  | DeleteResourcesDispatchArgs<T>
  | DoneDeleteResourcesDispatchArgs<T>
  | ErrorDeleteResourcesDispatchArgs<T>;

export class DeleteAction<T> {
  _dispatch: (DeleteActionDispatchArgs<T>) => void;

  constructor(dispatch: (DeleteActionDispatchArgs<T>) => void) {
    this._dispatch = dispatch;
  }

  deleteResources(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return new AsyncActionRunner((opts: AsyncRequestOptions<T>) => {
      this._dispatch({
        type: ActionType,
        command: 'deleteResources',
        targets: ids,
        settings: settings,
        caller: this,
        requestOptions: opts
      });
    });
  }

  static reduceDeleteResources(
    store: ResourceStore<T>,
    action: DeleteResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    const settings = action.settings;
    const caller = action.caller;
    (action.targets || []).forEach(id => {
      const uri = url.defaultResolver.resolve(url.join(settings.getCollectionUrl(), `${id}.json`));
      const req = action.requestOptions.urlQuery
        ? request.delete(`${uri}?${action.requestOptions.urlQuery}`)
        : request.delete(uri);
      req.end((err, res) => {
        err = genAPIError(err, res);
        if (err) {
          caller.errorDeleteResources(
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
          caller.doneDeleteResources(settings, [res.body], action.requestOptions);
        }
      });
      const found = findResource(store.data, store.dataIndex, id);
      if (found) {
        found.resource.__state.status = ResourceStatusValues.DELETING;
      }
    });
    return store;
  }

  doneDeleteResources(
    settings: ResourceSettings<T>,
    targets: Array<string>,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'doneDeleteResources',
      targets: targets,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceDoneDeleteResources(
    store: ResourceStore<T>,
    action: DoneDeleteResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    const deleted = deleteResources(store.data, store.dataIndex, action.targets);
    if (deleted.length > 0) {
      store.dataIndex = rebuildIndexes(store.data, action.settings);
      deleted.forEach(action.requestOptions.onSuccess);
    }
    return store;
  }

  errorDeleteResources(
    settings: ResourceSettings<T>,
    errors: ResourceErrors,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'errorDeleteResources',
      resourceErrors: errors,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceErrorDeleteResources(
    store: ResourceStore<T>,
    action: ErrorDeleteResourcesDispatchArgs<T>
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
}
