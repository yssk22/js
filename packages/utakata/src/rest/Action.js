/* @flow */
import { ResourceSettings } from './ResourceSettings';
export const ActionType = 'YSSK22.REDUX.REST';

export type ActionDispatchArgs<T> = {
  type: 'YSSK22.REDUX.REST',
  settings: ResourceSettings<T>,
  command: string
};
