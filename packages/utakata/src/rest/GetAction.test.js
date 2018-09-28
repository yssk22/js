/* @flow */
import { object } from '@yssk22/mizuki';
import { ActionType } from './Action';
import { ResourceStatusValues } from './Store';
import {
  GetAction,
  type GetResourcesDispatchArgs,
  type DoneGetResourcesDispatchArgs,
  type ErrorGetResourcesDispatchArgs,
  type GetCollectionDispatchArgs,
  type DoneGetCollectionDispatchArgs,
  type ErrorGetCollectionDispatchArgs
} from './GetAction';
import * as TestHelper from './TestHelper';
jest.mock('./request');

describe('rest.Get', () => {
  describe('step 1. get a resource', () => {
    const id = '123';
    const original = {
      id: id,
      message: 'resource message',
      __state: {
        status: ResourceStatusValues.NONE,
        error: null,
        fieldErrors: {},
        previous: null
      }
    };
    const step1Store = TestHelper.genStore([original]);
    const dispatch = jest.fn();
    const action = new GetAction(dispatch);
    const runner = action.getResources(TestHelper.ModelSettings, id);
    runner.run();
    const dispatchArgs = ((dispatch.mock.calls[0][0]: any): GetResourcesDispatchArgs<
      TestHelper.Model
    >);

    test('getResources dispatch a getResources command', () => {
      expect(dispatchArgs).toEqual({
        type: ActionType,
        command: 'getResources',
        targets: [id],
        settings: TestHelper.ModelSettings,
        caller: action,
        requestOptions: runner._options
      });
    });

    describe('step 1-1. success', () => {
      const latest = {
        id: id,
        message: 'server message'
      };
      TestHelper.mockResponse('GET', latest);
      const doneGetResourcesMock = jest.fn();
      (dispatchArgs.caller: any).doneGetResources = doneGetResourcesMock;
      const step11Store = GetAction.reduceGetResources(object.deepCopy(step1Store), dispatchArgs);
      test('reduceGetResources update a resource state to `reading`', () => {
        expect(step11Store.dataIndex[id]).toBe(0);
        expect(step11Store.data).toEqual([
          {
            id: id,
            message: 'resource message',
            __state: {
              status: 'reading',
              error: null,
              fieldErrors: {},
              previous: null
            }
          }
        ]);
        expect(doneGetResourcesMock).toBeCalledWith(
          TestHelper.ModelSettings,
          [latest],
          runner._options
        );
      });

      describe('then, update a resource', () => {
        const dispatch = jest.fn();
        const action = new GetAction(dispatch);
        action.doneGetResources(TestHelper.ModelSettings, [latest], runner._options);
        const dispatchArgs = ((dispatch.mock.calls[0][0]: any): DoneGetResourcesDispatchArgs<
          TestHelper.Model
        >);
        test('doneGetResources dispatch a doneGetResources command', () => {
          expect(dispatchArgs).toEqual({
            type: ActionType,
            command: 'doneGetResources',
            resources: [latest],
            settings: TestHelper.ModelSettings,
            caller: action,
            requestOptions: runner._options
          });
        });

        const step211Store = GetAction.reduceDoneGetResources(
          object.deepCopy(step11Store),
          dispatchArgs
        );
        test('reduceDoneGetResources update a resource', () => {
          expect(step211Store.dataIndex[id]).toBe(0);
          expect(step211Store.data).toEqual([
            Object.assign({}, latest, {
              __state: {
                error: null,
                fieldErrors: {},
                previous: null,
                status: 'none'
              }
            })
          ]);
        });
      });
    });

    describe('step 1-2. error', () => {
      const errors = [TestHelper.ExpectedAPIError, TestHelper.ExpectedUnknownError];
      const states = [
        {
          error: TestHelper.ExpectedAPIError.toString(),
          fieldErrors: {},
          previous: null,
          status: 'none'
        },
        {
          error: TestHelper.ExpectedUnknownError.toString(),
          fieldErrors: {},
          previous: null,
          status: 'none'
        }
      ];

      errors.forEach((e, i) => {
        TestHelper.mockErrrorResponse('GET', e);
        const error = {
          id: id,
          error: e
        };
        const expectedState = states[i];
        const errorGetCollectionMock = jest.fn();
        (dispatchArgs.caller: any).errorGetResources = errorGetCollectionMock;
        const step12store = GetAction.reduceGetResources(object.deepCopy(step1Store), dispatchArgs);
        test('reduceGetResources update a resource state to `reading`: ' + e.toString(), () => {
          expect(step12store.dataIndex[id]).toBe(0);
          expect(step12store.data).toEqual([
            {
              id: id,
              message: 'resource message',
              __state: {
                error: null,
                fieldErrors: {},
                previous: null,
                status: 'reading'
              }
            }
          ]);
          expect(errorGetCollectionMock).toBeCalledWith(
            TestHelper.ModelSettings,
            [error],
            runner._options
          );
        });

        describe('then, update a resource state to error: ' + e.toString(), () => {
          const dispatch = jest.fn();
          const action = new GetAction(dispatch);
          action.errorGetResources(TestHelper.ModelSettings, [error], runner._options);
          const dispatchArgs = ((dispatch.mock.calls[0][0]: any): ErrorGetResourcesDispatchArgs<
            TestHelper.Model
          >);
          test('errorGetResources dispatch a errorGetResources command: ' + e.toString(), () => {
            expect(dispatchArgs).toEqual({
              type: ActionType,
              command: 'errorGetResources',
              resourceErrors: [error],
              settings: TestHelper.ModelSettings,
              caller: action,
              requestOptions: runner._options
            });
          });

          const step121Store = GetAction.reduceErrorGetResources(
            object.deepCopy(step12store),
            dispatchArgs
          );
          test('reduceErrorGetResources update a resource state: ' + e.toString(), () => {
            expect(step121Store.dataIndex[id]).toBe(0);
            expect(step121Store.data).toEqual([
              {
                id: id,
                message: 'resource message',
                __state: expectedState
              }
            ]);
          });
        });
      });
    });
  });

  describe('step 2. get a collection', () => {
    const step1Store = TestHelper.genStore([]);
    const dispatch = jest.fn();
    const action = new GetAction(dispatch);
    const runner = action.getCollection(TestHelper.ModelSettings);
    runner.run();
    const dispatchArgs = ((dispatch.mock.calls[0][0]: any): GetCollectionDispatchArgs<
      TestHelper.Model
    >);

    test('getCollection dispatch a getCollection command', () => {
      expect(dispatchArgs).toEqual({
        type: ActionType,
        command: 'getCollection',
        settings: TestHelper.ModelSettings,
        caller: action,
        requestOptions: runner._options
      });
    });

    describe('step 2-1. success', () => {
      const latest = {
        id: '123',
        message: 'server message'
      };
      TestHelper.mockResponse('GET', [latest]);
      const doneGetCollectionMock = jest.fn();
      (dispatchArgs.caller: any).doneGetCollection = doneGetCollectionMock;
      const step11Store = GetAction.reduceGetCollection(object.deepCopy(step1Store), dispatchArgs);
      test('reduceGetCollection update a collection state to `reading`', () => {
        expect(step11Store.status).toBe('reading');
        expect(step11Store.data).toEqual([]);
        expect(doneGetCollectionMock).toBeCalledWith(
          TestHelper.ModelSettings,
          [latest],
          runner._options
        );
      });

      describe('then, update a collection', () => {
        const dispatch = jest.fn();
        const action = new GetAction(dispatch);
        action.doneGetCollection(TestHelper.ModelSettings, [latest], runner._options);
        const dispatchArgs = ((dispatch.mock.calls[0][0]: any): DoneGetCollectionDispatchArgs<
          TestHelper.Model
        >);
        test('doneGetResources dispatch a doneGetResources command', () => {
          expect(dispatchArgs).toEqual({
            type: ActionType,
            command: 'doneGetCollection',
            resources: [latest],
            settings: TestHelper.ModelSettings,
            caller: action,
            requestOptions: runner._options
          });
        });

        const step211Store = GetAction.reduceDoneGetCollection(
          object.deepCopy(step11Store),
          dispatchArgs
        );
        test('reduceDoneGetCollection update a collection', () => {
          expect(step211Store.dataIndex[latest.id]).toBe(0);
          expect(step211Store.data).toEqual([
            Object.assign({}, latest, {
              __state: {
                error: null,
                fieldErrors: {},
                previous: null,
                status: 'none'
              }
            })
          ]);
        });
      });
    });

    describe('step 1-2. error', () => {
      const errors = [TestHelper.ExpectedAPIError, TestHelper.ExpectedUnknownError];
      errors.forEach((e, i) => {
        TestHelper.mockErrrorResponse('GET', e);
        const errorGetCollectionMock = jest.fn();
        (dispatchArgs.caller: any).errorGetCollection = errorGetCollectionMock;
        const step12store = GetAction.reduceGetCollection(
          object.deepCopy(step1Store),
          dispatchArgs
        );
        test('reduceGetCollection update a resource state to `reading`: ' + e.toString(), () => {
          expect(step12store.status).toBe('reading');
          expect(errorGetCollectionMock).toBeCalledWith(
            TestHelper.ModelSettings,
            e,
            runner._options
          );
        });

        describe('then, update a collection state to error: ' + e.toString(), () => {
          const dispatch = jest.fn();
          const action = new GetAction(dispatch);
          action.errorGetCollection(TestHelper.ModelSettings, e, runner._options);
          const dispatchArgs = ((dispatch.mock.calls[0][0]: any): ErrorGetCollectionDispatchArgs<
            TestHelper.Model
          >);
          test('errorGetCollection dispatch a errorGetCollection command: ' + e.toString(), () => {
            expect(dispatchArgs).toEqual({
              type: ActionType,
              command: 'errorGetCollection',
              error: e,
              settings: TestHelper.ModelSettings,
              caller: action,
              requestOptions: runner._options
            });
          });

          const step121Store = GetAction.reduceErrorGetCollection(
            object.deepCopy(step12store),
            dispatchArgs
          );
          test('reduceErrorGetCollection update a resource state: ' + e.toString(), () => {
            expect(step121Store.error).toEqual(e.toString());
            expect(step121Store.data).toEqual([]);
          });
        });
      });
    });
  });
});
