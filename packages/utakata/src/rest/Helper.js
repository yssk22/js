/* @flow */
import { events } from '@yssk22/mizuki';

import { type ResourceStore, ResourceStatusValues, type ResourceWithState } from './Store';
import { ResourceSettings } from './ResourceSettings';

const ComponentName = '@yssk22/utakata/rest/Helper';

export default class Helper<T> {
  settings: ResourceSettings<T>;
  store: ResourceStore<T>;

  static getError<T>(r: ResourceWithState<T>): ?string {
    return r.__state.error;
  }

  static getFieldErrors<T>(r: ResourceWithState<T>): { [string]: string } {
    return Object.assign({}, r.__state.fieldErrors); // pass copies
  }

  static isCreating<T>(r: ResourceWithState<T>): boolean {
    return r.__state.status === ResourceStatusValues.CREATING;
  }

  static isUpdating<T>(r: ResourceWithState<T>): boolean {
    return r.__state.status === ResourceStatusValues.UPDATING;
  }

  static isDeleting<T>(r: ResourceWithState<T>): boolean {
    return r.__state.status === ResourceStatusValues.DELETING;
  }

  constructor(settings: ResourceSettings<T>, props: any) {
    this.settings = settings;
    this.store = props[settings.getCollectionUrl()];
    if (this.store === undefined) {
      if (!props) {
        events.fatal(
          ComponentName,
          `Rest helper error - you may need to pass "this.props.rest" but passed ${props}. ` +
            `Check your component is wrapped by withRest() HoC.`
        );
      }
      if (props.rest && props.rest[settings.getCollectionUrl()]) {
        events.fatal(
          ComponentName,
          'Rest helper error - you may need to pass "this.props.rest" instead of "this.props" to Helper'
        );
      }
    }
  }

  getError(): ?string {
    if (!this.store) {
      return null;
    }
    return this.store.error;
  }

  getData(): Array<ResourceWithState<T>> {
    if (!this.store) {
      return [];
    }
    return this.store.data;
  }

  getStatelessData(): Array<T> {
    if (!this.store) {
      return [];
    }
    return ((this.store.data: any): Array<T>);
  }

  getDrafts(): Array<ResourceWithState<T>> {
    if (!this.store) {
      return [];
    }
    return this.store.drafts;
  }

  getStatelessDrafts(): Array<T> {
    if (!this.store) {
      return [];
    }
    return ((this.store.drafts: any): Array<T>);
  }

  isCollectionLoading(): boolean {
    if (!this.store) {
      return true;
    }
    return this.store.status === ResourceStatusValues.READING;
  }
}
