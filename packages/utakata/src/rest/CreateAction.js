/* @flow */
import { url, uuid } from '@yssk22/mizuki';
import request from './request';
import { type ActionDispatchArgs, ActionType } from './Action';
import { genAPIError, FieldErrors } from './APIError';
import { AsyncActionRunner, type AsyncRequestOptions } from './AsyncActionRunner';
import { ResourceSettings } from './ResourceSettings';
import {
  type ResourceErrors,
  type ResourceStore,
  type ResourceState,
  type ResourceWithState,
  ResourceStatusValues,
  updateByServer,
  findResource,
  deleteResources,
  rebuildIndexes
} from './Store';

export type CreateDraftDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'createDraft',
  targets: Array<string>,
  caller: CreateAction<T>
};

export type SaveDraftsDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'saveDrafts',
  targets: Array<string>,
  caller: CreateAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type DoneSaveDraftsDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'doneSaveDrafts',
  caller: CreateAction<T>,
  deletes: Array<string>,
  resources: Array<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type ErrorSaveDraftsDispatchArgs<T> = ActionDispatchArgs<T> & {
  command: 'errorSaveDrafts',
  resourceErrors: ResourceErrors,
  caller: CreateAction<T>,
  requestOptions: AsyncRequestOptions<T>
};

export type CreateActionDispatchArgs<T> =
  | CreateDraftDispatchArgs<T>
  | SaveDraftsDispatchArgs<T>
  | DoneSaveDraftsDispatchArgs<T>
  | ErrorSaveDraftsDispatchArgs<T>;

export class CreateAction<T> {
  _dispatch: (CreateActionDispatchArgs<T>) => void;

  constructor(dispatch: (CreateActionDispatchArgs<T>) => void) {
    this._dispatch = dispatch;
  }

  createDraft(settings: ResourceSettings<T>): string {
    const id = uuid.uuid4();
    this._dispatch({
      type: ActionType,
      command: 'createDraft',
      targets: [id],
      settings: settings,
      caller: this
    });
    return id;
  }

  static reduceCreateDraft<T>(
    store: ResourceStore<T>,
    action: CreateDraftDispatchArgs<T>
  ): ResourceStore<T> {
    (action.targets || []).forEach(id => {
      const resource = (Object.assign({}, action.settings.createDraft(id), {
        __state: ({
          status: ResourceStatusValues.DRAFT,
          previous: null,
          error: null,
          fieldErrors: {}
        }: ResourceState<T>)
      }): ResourceWithState<T>);
      const idx = store.drafts.push(resource) - 1;
      store.draftIndex[id] = idx;
    });
    return store;
  }

  saveDrafts(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return new AsyncActionRunner((opts: AsyncRequestOptions<T>) => {
      this._dispatch({
        type: ActionType,
        command: 'saveDrafts',
        targets: ids,
        settings: settings,
        caller: this,
        requestOptions: opts
      });
    });
  }

  static reduceSaveDrafts<T>(
    store: ResourceStore<T>,
    action: SaveDraftsDispatchArgs<T>
  ): ResourceStore<T> {
    const caller = action.caller;
    const settings = action.settings;
    const uri = url.defaultResolver.resolve(settings.getCollectionUrl());
    (action.targets || []).forEach(id => {
      const found = findResource(store.drafts, store.draftIndex, id);
      if (found) {
        const req = action.requestOptions.urlQuery
          ? request.post(`${uri}?${action.requestOptions.urlQuery}`)
          : request.post(uri);
        const params = settings.createParams(found.resource);
        req.send(params);
        req.end((err, res) => {
          err = genAPIError(err, res);
          if (err) {
            caller.errorSaveDrafts(
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
            caller.doneSaveDrafts(settings, [res.body], [id], action.requestOptions);
          }
        });
        found.resource.__state = {
          status: ResourceStatusValues.CREATING,
          previous: null,
          error: null,
          fieldErrors: found.resource.__state.fieldErrors
        };
      }
    });
    return store;
  }

  doneSaveDrafts(
    settings: ResourceSettings<T>,
    resources: Array<T>,
    deletes: Array<string>,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch(
      ({
        type: ActionType,
        command: 'doneSaveDrafts',
        resources: resources,
        deletes: deletes,
        settings: settings,
        caller: this,
        requestOptions: opts
      }: DoneSaveDraftsDispatchArgs<T>)
    );
  }

  static reduceDoneSaveDrafts<T>(
    store: ResourceStore<T>,
    action: DoneSaveDraftsDispatchArgs<T>
  ): ResourceStore<T> {
    const deleted = deleteResources(store.drafts, store.draftIndex, action.deletes);
    if (deleted) {
      store.draftIndex = rebuildIndexes(store.drafts, action.settings);
    }
    const updated = updateByServer(store, action.resources, action.settings);
    updated.forEach(action.requestOptions.onSuccess);
    return store;
  }

  errorSaveDrafts(
    settings: ResourceSettings<T>,
    errors: ResourceErrors,
    opts: AsyncRequestOptions<T>
  ) {
    this._dispatch(
      ({
        type: ActionType,
        command: 'errorSaveDrafts',
        resourceErrors: errors,
        settings: settings,
        caller: this,
        requestOptions: opts
      }: ErrorSaveDraftsDispatchArgs<T>)
    );
  }

  static reduceErrorSaveDrafts<T>(
    store: ResourceStore<T>,
    action: ErrorSaveDraftsDispatchArgs<T>
  ): ResourceStore<T> {
    action.resourceErrors.forEach(e => {
      const id = e.id;
      const found = findResource(store.drafts, store.draftIndex, id);
      if (found) {
        found.resource.__state = {
          status: ResourceStatusValues.DRAFT,
          previous: null,
          error: e.error ? e.error.toString() : null,
          fieldErrors: e.error instanceof FieldErrors ? e.error.fields : {}
        };
        action.requestOptions.onFailure(e.error);
      }
    });
    return store;
  }
}
