/* @flow */
import { url } from '@yssk22/mizuki';
import { rest } from '@yssk22/utakata';
import { type RestResource } from '@yssk22/utakata';

export type Task = RestResource<{
  path: string,
  description: string,
  schedule: string
}>;

export const genTaskResourceSettings = (urlPrefix: string): rest.ResourceSettings<Task> => {
  return new rest.ResourceSettings(url.join(urlPrefix, '/admin/api/tasks/'), {
    getId: (v: Task): string => {
      return v.path;
    },
    collectionSortStrategy: rest.CollectionSortStrategy.sortByFieldValue('path')
  });
};

export type Progress = {
  total: number,
  current: number,
  message?: string
};
export type Status = 'unknown' | 'ready' | 'running' | 'success' | 'failure' | 'timeout';
export type TaskStatus = RestResource<{
  id: string,
  status: Status,
  start_at?: ?Date,
  finish_at?: ?Date,
  params?: ?string,
  error?: ?string,
  progress?: ?Progress
}>;

export const genTaskStatusResourceSettings = (path: string): rest.ResourceSettings<TaskStatus> => {
  return new rest.ResourceSettings(url.join(path), {
    getId: (v: TaskStatus): string => {
      return v.id;
    },
    collectionSortStrategy: rest.CollectionSortStrategy.sortByFieldValue('start_at', 'desc')
  });
};
