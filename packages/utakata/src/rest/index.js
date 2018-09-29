/* @flow */
import React, { type ComponentType, type Node } from 'react';
import { connect } from 'react-redux';
import { createStore as _createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import RouterReducer from '../RouterReducer';
import RestAction from './RestAction';
import { ResourceSettings } from './ResourceSettings';
import { type RestResourceStoreCollection, type ResourceWithState, rebuildIndexes } from './Store';
import { APIError } from './APIError';
import Helper from './Helper';
import * as CollectionSortStrategy from './CollectionSortStrategy';

const defaultAction = new RestAction();
const mockStore = configureStore();
const createStore = () => {
  return compose(applyMiddleware(thunk))(_createStore)(
    combineReducers({
      routes: RouterReducer,
      routing: RouterReducer,
      rest: RestAction.reduce
    })
  );
};

type Props = {
  rest: RestResourceStoreCollection
};

const withResources = (c: ComponentType<*>) => {
  return connect((state: Props) => {
    return {
      rest: state.rest
    };
  })(c);
};

type ProviderProps = {
  dispatch: any,
  children?: Node
};

const Provider = connect()(
  class Provider_ extends React.Component<ProviderProps> {
    constructor(props: ProviderProps) {
      super(props);
      defaultAction.setDispatch(props.dispatch);
    }
    render() {
      return this.props.children;
    }
  }
);

class MockPropsCreator<T> {
  _settings: ResourceSettings<T>;
  _data: Array<ResourceWithState<T>>;
  _drafts: Array<ResourceWithState<T>>;
  _status: 'none' | 'reading';
  _error: ?string;

  constructor(settings: ResourceSettings<T>) {
    this._settings = settings;
    this._data = [];
    this._drafts = [];
    this._status = 'none';
    this._error = null;
  }

  data(v: T): MockPropsCreator<T> {
    this._data.push(
      Object.assign({}, v, {
        __state: {
          status: 'none',
          previous: null,
          error: null,
          fieldErrors: {}
        }
      })
    );
    return this;
  }

  draft(v: T): MockPropsCreator<T> {
    this._drafts.push(
      Object.assign({}, v, {
        __state: {
          status: 'none',
          previous: null,
          error: null,
          fieldErrors: {}
        }
      })
    );
    return this;
  }

  status(s: 'none' | 'reading'): MockPropsCreator<T> {
    this._status = s;
    return this;
  }

  error(e: string): MockPropsCreator<T> {
    this._error = e;
    return this;
  }

  mock(): any {
    const state = {
      data: this._data,
      dataIndex: rebuildIndexes(this._data, this._settings),
      drafts: this._drafts,
      draftIndex: rebuildIndexes(this._drafts, this._settings),
      status: this._status,
      error: this._error
    };
    const props = {
      rest: {}
    };
    props.rest[this._settings.getCollectionUrl()] = state;
    return mockStore(props);
  }
}

function mockProps<T>(settings: ResourceSettings<T>): MockPropsCreator<T> {
  return new MockPropsCreator(settings);
}

export type { Props, ResourceWithState as Resource };

export {
  defaultAction as Action,
  APIError,
  createStore,
  CollectionSortStrategy,
  Helper,
  ResourceSettings,
  Provider,
  mockProps,
  withResources
};
