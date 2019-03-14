/* @flow */
import { events, environment } from '@yssk22/mizuki';
import { CreateAction } from './CreateAction';
import { DeleteAction } from './DeleteAction';
import { GetAction } from './GetAction';
import { UpdateAction } from './UpdateAction';
import { type ResourceSettings } from './ResourceSettings';
import { type AsyncActionRunner } from './AsyncActionRunner';
import { type UpdateArgs, genInitialState, validateStore } from './Store';
import { ActionType } from './Action';

const commands = {
  createDraft: CreateAction,
  saveDrafts: CreateAction,
  doneSaveDrafts: CreateAction,
  errorSaveDrafts: CreateAction,
  deleteResources: DeleteAction,
  doneDeleteResources: DeleteAction,
  errorDeleteResources: DeleteAction,
  getResources: GetAction,
  doneGetResources: GetAction,
  errorGetResources: GetAction,
  getCollection: GetAction,
  doneGetCollection: GetAction,
  errorGetCollection: GetAction,
  updateDrafts: UpdateAction,
  updateResources: UpdateAction,
  saveResources: UpdateAction,
  doneSaveResources: UpdateAction,
  errorSaveResources: UpdateAction
};

export default class RestAction<T> {
  _createAction: CreateAction<T>;
  _updateAction: UpdateAction<T>;
  _deleteAction: DeleteAction<T>;
  _getAction: GetAction<T>;

  constructor() {}

  setDispatch(dispatch: any => void) {
    this._createAction = new CreateAction(dispatch);
    this._updateAction = new UpdateAction(dispatch);
    this._deleteAction = new DeleteAction(dispatch);
    this._getAction = new GetAction(dispatch);
  }

  createDraft(settings: ResourceSettings<T>): string {
    return this._createAction.createDraft(settings);
  }

  saveDrafts(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return this._createAction.saveDrafts(settings, ...ids);
  }

  deleteResources(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return this._deleteAction.deleteResources(settings, ...ids);
  }

  getResources(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return this._getAction.getResources(settings, ...ids);
  }

  getCollection(settings: ResourceSettings<T>): AsyncActionRunner<T> {
    return this._getAction.getCollection(settings);
  }

  updateDrafts(settings: ResourceSettings<T>, update: UpdateArgs, ...updates: Array<UpdateArgs>) {
    return this._updateAction.updateDrafts(settings, update, ...updates);
  }

  updateResources(
    settings: ResourceSettings<T>,
    update: UpdateArgs,
    ...updates: Array<UpdateArgs>
  ) {
    return this._updateAction.updateResources(settings, update, ...updates);
  }

  revertResources(settings: ResourceSettings<T>, ...ids: Array<string>) {
    return this._updateAction.revertResources(settings, ...ids);
  }

  saveResources(settings: ResourceSettings<T>, ...ids: Array<string>): AsyncActionRunner<T> {
    return this._updateAction.saveResources(settings, ...ids);
  }

  static reduce(state: any = {}, action: any) {
    const ComponentName = '@yssk22/utakata/rest/reduce';
    if (action.type !== ActionType) {
      console.log(action.type, ActionType);
      return state;
    }
    const klass = commands[action.command];
    if (!klass) {
      events.fatal(ComponentName, `no "${action.command || 'undefined'}" class is defined`);
    }
    const funcName = `reduce${action.command[0].toUpperCase()}${action.command.substr(1)}`;
    const fun = klass[funcName];
    if (!fun) {
      events.fatal(ComponentName, `no "${funcName}" function is defined in ${klass.toString()}`);
    }
    const settings = action.settings;
    const collectionKey = settings.getCollectionUrl();
    let store = state[collectionKey] || genInitialState();
    try {
      const result = fun(store, action);
      if (action.settings.shouldValidateReducer()) {
        validateStore(result);
      }
      const newState = {};
      newState[collectionKey] = result;
      return Object.assign({}, state, newState);
    } catch (e) {
      const params = { state, collectionKey, store, action };
      if (environment.maybeTest()) {
        events.fatal(ComponentName, `'${action.command}' throws an error: ${e.message}`, params);
      } else {
        events.error(ComponentName, `'${action.command}' throws an error: ${e.message}`, params);
      }
    }
    return state;
  }
}
