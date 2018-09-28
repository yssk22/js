/* @flow */
import { uuid } from '@yssk22/mizuki';
import { ResourceSettings } from './ResourceSettings';
import { APIError, FieldErrors } from './APIError';
import { type ResourceStore, type ResourceWithState, genIndex } from './Store';
import request from './request';

export const CollectionPath: string = '/test_resources/';

export type Model = {
  id: string,
  message: string
};

export const ModelSettings = new ResourceSettings(CollectionPath, {
  createDraft: (id: string): Model => {
    return {
      id: id,
      message: 'default message'
    };
  }
});

export const genResource = function(): Model {
  const id = uuid.uuid4();
  return {
    id: id,
    message: `random - ${id}`
  };
};

export const genStore = function(
  data: Array<ResourceWithState<Model>>,
  drafts?: Array<ResourceWithState<Model>>
): ResourceStore<Model> {
  drafts = drafts ? drafts : [];
  return {
    data: data,
    dataIndex: genIndex(data, ModelSettings),
    drafts: drafts ? drafts : [],
    draftIndex: genIndex(drafts, ModelSettings),
    status: 'none',
    error: null
  };
};

export const ExpectedUnknownError = new Error('unknown error');
export const ExpectedAPIError = new APIError({ code: 'mock_error', message: 'API Error' });
export const ExpectedFieldErrors = new FieldErrors({
  message: 'empty'
});

export const mockErrrorResponse = (method: string, err: Error) => {
  return _mockResponse(method, err);
};

export const mockResponse = (method: string, body: Model | Array<Model>) => {
  return _mockResponse(method, body);
};

const _mockResponse = (method: string, body: Model | Array<Model> | APIError | Error) => {
  request[method.toLowerCase()].mockImplementation(url => {
    return {
      url: url,
      method: method.toUpperCase(),
      send: () => {
        return this;
      },
      set: () => {
        return this;
      },
      end: cb => {
        if (body instanceof APIError) {
          cb(new Error('mock error'), {
            body: {
              code: body.code,
              message: body.message
            },
            req: {
              url: url,
              method: method.toUpperCase()
            }
          });
        } else if (body instanceof Error) {
          cb(body, {
            body: {},
            req: {
              url: url,
              method: method.toUpperCase()
            }
          });
        } else {
          cb(null, {
            body: body,
            req: {
              url: url,
              method: method.toUpperCase()
            }
          });
        }
      }
    };
  });
};
