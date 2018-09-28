/* @flow */
import { CreateAction } from './CreateAction';
import RestAction from './RestAction';
import { ResourceSettings } from './ResourceSettings';

describe('RestAction', () => {
  describe('reduce', () => {
    test('nothing changed if action is not owned by RestAction', () => {
      const state = RestAction.reduce(
        {},
        {
          foo: 'bar'
        }
      );
      expect(state).toEqual({});
    });

    test('throw an Error if command is not defined', () => {
      expect(() => {
        RestAction.reduce(
          {},
          {
            type: 'YSSK22.REDUX.REST',
            command: 'invalid_command'
          }
        );
      }).toThrowError('[@yssk22/utakata/rest/reduce] no "invalid_command" class is defined');
    });

    test('throw an Error if a result state is not valid', () => {
      const settings = new ResourceSettings('/path/to/resources/');
      (CreateAction: any).reduceCreateDraft = jest.fn((state, action) => {
        return {
          data: [
            {
              id: '123',
              foo: new Date()
            }
          ],
          dataIndex: {
            '123': 0
          },
          drafts: [],
          draftIndex: {},
          error: null,
          state: 'none'
        };
      });
      expect(() => {
        RestAction.reduce(
          {},
          {
            type: 'YSSK22.REDUX.REST',
            command: 'createDraft',
            settings: settings
          }
        );
      }).toThrowError(
        `[@yssk22/utakata/rest/reduce] 'createDraft' throws an error: ` +
          `key "123" contains non-JSON serialiable objects`
      );
    });
  });
});
