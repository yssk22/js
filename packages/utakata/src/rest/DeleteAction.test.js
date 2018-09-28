/* @flow */
import { object } from '@yssk22/mizuki';
import { ActionType } from './Action';
import { ResourceStatusValues } from './Store';
import {
  DeleteAction,
  type DeleteResourcesDispatchArgs,
  type DoneDeleteResourcesDispatchArgs,
  type ErrorDeleteResourcesDispatchArgs
} from './DeleteAction';
import * as TestHelper from './TestHelper';
jest.mock('./request');

describe('rest.Delete', () => {
  describe('step 1. delete a resource', () => {
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
    const action = new DeleteAction(dispatch);
    const runner = action.deleteResources(TestHelper.ModelSettings, id);
    runner.run();
    const dispatchArgs = ((dispatch.mock.calls[0][0]: any): DeleteResourcesDispatchArgs<
      TestHelper.Model
    >);

    test('deleteResources dispatch a deleteResources command', () => {
      expect(dispatchArgs).toEqual({
        type: ActionType,
        command: 'deleteResources',
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
      TestHelper.mockResponse('DELETE', latest);
      const doneDeleteResourcesMock = jest.fn();
      (dispatchArgs.caller: any).doneDeleteResources = doneDeleteResourcesMock;
      const step11Store = DeleteAction.reduceDeleteResources(
        object.deepCopy(step1Store),
        dispatchArgs
      );
      test('reduceDeleteResources update a resource state to `deleting`', () => {
        expect(step11Store.dataIndex[id]).toBe(0);
        expect(step11Store.data).toEqual([
          {
            id: id,
            message: 'resource message',
            __state: {
              status: 'deleting',
              error: null,
              fieldErrors: {},
              previous: null
            }
          }
        ]);
        expect(doneDeleteResourcesMock).toBeCalledWith(
          TestHelper.ModelSettings,
          [latest],
          runner._options
        );
      });

      describe('then, delete a resource', () => {
        const dispatch = jest.fn();
        const action = new DeleteAction(dispatch);
        action.doneDeleteResources(TestHelper.ModelSettings, [id], runner._options);
        const dispatchArgs = ((dispatch.mock.calls[0][0]: any): DoneDeleteResourcesDispatchArgs<
          TestHelper.Model
        >);
        test('doneDeleteResources dispatch a doneDeleteResources command', () => {
          expect(dispatchArgs).toEqual({
            type: ActionType,
            command: 'doneDeleteResources',
            targets: [id],
            settings: TestHelper.ModelSettings,
            caller: action,
            requestOptions: runner._options
          });
        });

        const step211Store = DeleteAction.reduceDoneDeleteResources(
          object.deepCopy(step11Store),
          dispatchArgs
        );
        test('reduceDoneDeleteResources delete a resource', () => {
          expect(step211Store.dataIndex).toEqual({});
          expect(step211Store.data).toEqual([]);
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
        TestHelper.mockErrrorResponse('DELETE', e);
        const error = {
          id: id,
          error: e
        };
        const expectedState = states[i];
        const errorDeleteResourcesMock = jest.fn();
        (dispatchArgs.caller: any).errorDeleteResources = errorDeleteResourcesMock;
        const step12store = DeleteAction.reduceDeleteResources(
          object.deepCopy(step1Store),
          dispatchArgs
        );
        test('reduceDeleteResources update a resource state to `deleting`: ' + e.toString(), () => {
          expect(step12store.dataIndex[id]).toBe(0);
          expect(step12store.data).toEqual([
            {
              id: id,
              message: 'resource message',
              __state: {
                error: null,
                fieldErrors: {},
                previous: null,
                status: 'deleting'
              }
            }
          ]);
          expect(errorDeleteResourcesMock).toBeCalledWith(
            TestHelper.ModelSettings,
            [error],
            runner._options
          );
        });

        describe('then, update a resource state to error: ' + e.toString(), () => {
          const dispatch = jest.fn();
          const action = new DeleteAction(dispatch);
          action.errorDeleteResources(TestHelper.ModelSettings, [error], runner._options);
          const dispatchArgs = ((dispatch.mock.calls[0][0]: any): ErrorDeleteResourcesDispatchArgs<
            TestHelper.Model
          >);
          test(
            'errorDeleteResources dispatch a errorDeleteResources command: ' + e.toString(),
            () => {
              expect(dispatchArgs).toEqual({
                type: ActionType,
                command: 'errorDeleteResources',
                resourceErrors: [error],
                settings: TestHelper.ModelSettings,
                caller: action,
                requestOptions: runner._options
              });
            }
          );

          const step121Store = DeleteAction.reduceErrorDeleteResources(
            object.deepCopy(step12store),
            dispatchArgs
          );
          test('reduceDoneSaveResources update a resource state: ' + e.toString(), () => {
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
});
