/* @flow */
import { url } from '@yssk22/mizuki';
import request from './request';
import { ResourceSettings } from './ResourceSettings';
import {
  type ResourceStore,
  type ResourceErrors,
  type UpdateArgs,
  ResourceStatusValues,
  revertStore,
  updateStore,
  findResource,
  updateByServer
} from './Store';
import { type ActionDispatchArgs, ActionType } from './Action';
import { genAPIError, FieldErrors } from './APIError';
import { AsyncActionRunner, type AsyncRequestOptions } from './AsyncActionRunner';

export type UpdateDraftsDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'updateDrafts',
  updates: Array<UpdateArgs>
};

export type UpdateResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'updateResources',
  updates: Array<UpdateArgs>
};

export type RevertResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'revertResources',
  targets: Array<string>
};

export type SaveResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'saveResources',
  targets: Array<string>,
  caller: UpdateAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type DoneSaveResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'doneSaveResources',
  resources: Array<T>,
  caller: UpdateAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type ErrorSaveResourcesDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'errorSaveResources',
  resourceErrors: ResourceErrors,
  caller: UpdateAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type UpdateActionDispatchArgs<T> =
  | UpdateDraftsDispatchArgs<T>
  | UpdateResourcesDispatchArgs<T>
  | RevertResourcesDispatchArgs<T>
  | SaveResourcesDispatchArgs<T>
  | DoneSaveResourcesDispatchArgs<T>
  | ErrorSaveResourcesDispatchArgs<T>;

export class UpdateAction<T> {
  _dispatch: (UpdateActionDispatchArgs<T>) => void;

  constructor(dispatch: (UpdateActionDispatchArgs<T>) => void) {
    this._dispatch = dispatch;
  }

  updateDrafts(settings: ResourceSettings<T>, update: UpdateArgs, ...updates: Array<UpdateArgs>) {
    this._dispatch({
      type: ActionType,
      command: 'updateDrafts',
      updates: [update].concat(...updates),
      settings: settings,
      caller: this
    });
  }

  static reduceUpdateDrafts<T>(
    store: ResourceStore<T>,
    action: UpdateDraftsDispatchArgs<T>
  ): ResourceStore<T> {
    updateStore(action.updates, store.drafts, store.draftIndex);
    return store;
  }

  updateResources(
    settings: ResourceSettings<T>,
    update: UpdateArgs,
    ...updates: Array<UpdateArgs>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'updateResources',
      updates: [update].concat(...updates),
      settings: settings,
      caller: this
    });
  }

  static reduceUpdateResources<T>(
    store: ResourceStore<T>,
    action: UpdateResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    updateStore(action.updates, store.data, store.dataIndex);
    return store;
  }

  revertResources(settings: ResourceSettings<T>, ...ids: Array<string>) {
    this._dispatch({
      type: ActionType,
      command: 'revertResources',
      targets: ids,
      settings: settings,
      caller: this
    });
  }

  static reduceRevertResources<T>(
    store: ResourceStore<T>,
    action: RevertResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    revertStore(action.targets || [], store.data, store.dataIndex);
    return store;
  }

  saveResources(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return new AsyncActionRunner((opts: AsyncRequestOptions<T>) => {
      this._dispatch({
        type: ActionType,
        command: 'saveResources',
        targets: ids,
        settings: settings,
        caller: this,
        requestOptions: opts
      });
    });
  }

  static reduceSaveResources<T>(
    store: ResourceStore<T>,
    action: SaveResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    const caller = action.caller;
    const settings = action.settings;
    (action.targets || []).forEach(id => {
      const uri = url.defaultResolver.resolve(url.join(settings.getCollectionUrl(), `${id}.json`));
      const found = findResource(store.data, store.dataIndex, id);
      if (found) {
        const req = action.requestOptions.urlQuery
          ? request.put(`${uri}?${action.requestOptions.urlQuery}`)
          : request.put(uri);
        const params = settings.updateParams(found.resource);
        req.send(params);
        req.end((err, res) => {
          err = genAPIError(err, res);
          if (err) {
            caller.errorSaveResources(
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
            caller.doneSaveResources(settings, [res.body], action.requestOptions);
          }
        });
        found.resource.__state.status = ResourceStatusValues.UPDATING;
        found.resource.__state.error = null;
      }
    });
    return store;
  }

  doneSaveResources(
    settings: ResourceSettings<T>,
    resources: Array<T>,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'doneSaveResources',
      resources: resources,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceDoneSaveResources<T>(
    store: ResourceStore<T>,
    action: DoneSaveResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    const updated = updateByServer(store, action.resources, action.settings);
    updated.forEach(action.requestOptions.onSuccess);
    return store;
  }

  errorSaveResources(
    settings: ResourceSettings<T>,
    errors: ResourceErrors,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch({
      type: ActionType,
      command: 'errorSaveResources',
      resourceErrors: errors,
      settings: settings,
      caller: this,
      requestOptions: opts
    });
  }

  static reduceErrorSaveResources<T>(
    store: ResourceStore<T>,
    action: ErrorSaveResourcesDispatchArgs<T>
  ): ResourceStore<T> {
    action.resourceErrors.forEach(e => {
      const id = e.id;
      const found = findResource(store.data, store.dataIndex, id);
      if (found) {
        found.resource.__state.status = ResourceStatusValues.EDIT;
        found.resource.__state.error = e.error.toString();
        found.resource.__state.fieldErrors = e.error instanceof FieldErrors ? e.error.fields : {};
        action.requestOptions.onFailure(e.error);
      }
    });
    return store;
  }
}
