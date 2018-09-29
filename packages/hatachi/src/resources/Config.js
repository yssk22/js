/* @flow */
import { url } from '@yssk22/mizuki';
import { rest } from '@yssk22/utakata';
import { type RestResource } from '@yssk22/utakata';

export type Config = RestResource<{
  key: string,
  value: string,
  description: string
}>;

export const genConfigResourceSettings = (urlPrefix: string): rest.ResourceSettings<Config> => {
  return new rest.ResourceSettings(url.join(urlPrefix, '/admin/api/configs/'), {
    getId: (v: Config): string => {
      return v.key;
    },
    updateParams: (v: Config): { [string]: string } => {
      return {
        value: v.value
      };
    },
    collectionSortStrategy: rest.CollectionSortStrategy.sortByFieldValue('key')
  });
};
