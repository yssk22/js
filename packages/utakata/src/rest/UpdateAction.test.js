/* @flow */
import { object } from '@yssk22/mizuki';
import { ActionType } from './Action';
import { ResourceStatusValues } from './Store';
import {
  UpdateAction,
  type UpdateDraftsDispatchArgs,
  type UpdateResourcesDispatchArgs,
  type SaveResourcesDispatchArgs,
  type DoneSaveResourcesDispatchArgs,
  type ErrorSaveResourcesDispatchArgs
} from './UpdateAction';
import * as TestHelper from './TestHelper';
jest.mock('./request');

describe('rest.Update', () => {
  describe('update draft', () => {
    const id = '123';
    const step0Store = TestHelper.genStore(
      [],
      [
        {
          id: id,
          message: 'draft message',
          __state: {
            status: ResourceStatusValues.DRAFT,
            error: null,
            fieldErrors: {},
            previous: null
          }
        }
      ]
    );
    describe('step1. update a draft locally', () => {
      const dispatch = jest.fn();
      const action = new UpdateAction(dispatch);
      action.updateDrafts(TestHelper.ModelSettings, {
        id: id,
        fields: {
          message: {
            type: 'update',
            value: 'Updated Message'
          }
        }
      });
      const dispatchArgs = ((dispatch.mock.calls[0][0]: any): UpdateDraftsDispatchArgs<
        TestHelper.Model
      >);
      test('updateDrafts dispatch a updateDrafts command', () => {
        expect(dispatchArgs).toEqual({
          type: ActionType,
          command: 'updateDrafts',
          updates: [
            {
              id: id,
              fields: {
                message: {
                  type: 'update',
                  value: 'Updated Message'
                }
              }
            }
          ],
          settings: TestHelper.ModelSettings,
          caller: action
        });
      });

      const step1Store = UpdateAction.reduceUpdateDrafts(object.deepCopy(step0Store), dispatchArgs);
      test('reduceUpdateDrafts updates fields in a draft in store', () => {
        expect(step1Store.draftIndex[id]).toBe(0);
        expect(step1Store.drafts).toEqual([
          {
            id: id,
            message: 'Updated Message',
            __state: {
              error: null,
              fieldErrors: {},
              previous: null,
              status: 'draft'
            }
          }
        ]);
      });
    });
  });

  describe('update a resource', () => {
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

    const step0Store = TestHelper.genStore([original]);

    describe('step 1. update a resource locally', () => {
      const dispatch = jest.fn();
      const action = new UpdateAction(dispatch);
      action.updateResources(TestHelper.ModelSettings, {
        id: id,
        fields: {
          message: {
            type: 'update',
            value: 'Updated Message'
          }
        }
      });
      const dispatchArgs = ((dispatch.mock.calls[0][0]: any): UpdateResourcesDispatchArgs<
        TestHelper.Model
      >);
      test('updateResources dispatch a updateResources command', () => {
        expect(dispatchArgs).toEqual({
          type: ActionType,
          command: 'updateResources',
          updates: [
            {
              id: id,
              fields: {
                message: {
                  type: 'update',
                  value: 'Updated Message'
                }
              }
            }
          ],
          settings: TestHelper.ModelSettings,
          caller: action
        });
      });

      const step1Store = UpdateAction.reduceUpdateResources(
        object.deepCopy(step0Store),
        dispatchArgs
      );
      test('reduceUpdateResources updates fields in a resource in store', () => {
        expect(step1Store.dataIndex[id]).toBe(0);
        expect(step1Store.data).toEqual([
          {
            id: id,
            message: 'Updated Message',
            __state: {
              error: null,
              fieldErrors: {},
              previous: original,
              status: 'edit'
            }
          }
        ]);
      });

      describe('step 2. save a resource', () => {
        const dispatch = jest.fn();
        const action = new UpdateAction(dispatch);
        const runner = action.saveResources(TestHelper.ModelSettings, id);
        runner.run();
        const dispatchArgs = ((dispatch.mock.calls[0][0]: any): SaveResourcesDispatchArgs<
          TestHelper.Model
        >);

        test('saveResources dispatch a createDraft command', () => {
          expect(dispatchArgs).toEqual({
            type: ActionType,
            command: 'saveResources',
            targets: [id],
            settings: TestHelper.ModelSettings,
            caller: action,
            requestOptions: runner._options
          });
        });

        describe('step 2-1. success', () => {
          const updated = {
            id: id,
            message: 'default message'
          };
          TestHelper.mockResponse('PUT', updated);
          const doneSaveResourcesMock = jest.fn();
          (dispatchArgs.caller: any).doneSaveResources = doneSaveResourcesMock;
          const step21Store = UpdateAction.reduceSaveResources(
            object.deepCopy(step1Store),
            dispatchArgs
          );
          test('reduceSaveResources update a resource state to `updating`', () => {
            expect(step21Store.dataIndex[id]).toBe(0);
            expect(step21Store.data).toEqual([
              {
                id: id,
                message: 'Updated Message',
                __state: {
                  status: 'updating',
                  error: null,
                  fieldErrors: {},
                  previous: original
                }
              }
            ]);
            expect(doneSaveResourcesMock).toBeCalledWith(
              TestHelper.ModelSettings,
              [updated],
              runner._options
            );
          });

          describe('then, update a resource', () => {
            const dispatch = jest.fn();
            const action = new UpdateAction(dispatch);
            action.doneSaveResources(TestHelper.ModelSettings, [updated], runner._options);
            const dispatchArgs = ((dispatch.mock.calls[0][0]: any): DoneSaveResourcesDispatchArgs<
              TestHelper.Model
            >);
            test('doneSaveResources dispatch a doneSaveDrafts command', () => {
              expect(dispatchArgs).toEqual({
                type: ActionType,
                command: 'doneSaveResources',
                resources: [updated],
                settings: TestHelper.ModelSettings,
                caller: action,
                requestOptions: runner._options
              });
            });

            const step211Store = UpdateAction.reduceDoneSaveResources(
              object.deepCopy(step21Store),
              dispatchArgs
            );
            test('reduceDoneSaveResources update a resource', () => {
              expect(step211Store.dataIndex[id]).toBe(0);
              expect(step211Store.data).toEqual([
                Object.assign({}, updated, {
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

        describe('step 2-2. error', () => {
          const errors = [
            TestHelper.ExpectedAPIError,
            TestHelper.ExpectedFieldErrors,
            TestHelper.ExpectedUnknownError
          ];
          const states = [
            {
              error: TestHelper.ExpectedAPIError.toString(),
              fieldErrors: {},
              previous: original,
              status: 'edit'
            },
            {
              error: TestHelper.ExpectedFieldErrors.toString(),
              fieldErrors: TestHelper.ExpectedFieldErrors.fields,
              previous: original,
              status: 'edit'
            },
            {
              error: TestHelper.ExpectedUnknownError.toString(),
              fieldErrors: {},
              previous: original,
              status: 'edit'
            }
          ];

          errors.forEach((e, i) => {
            TestHelper.mockErrrorResponse('PUT', e);
            const error = {
              id: id,
              error: e
            };
            const expectedState = states[i];
            const errorSaveResourcesMock = jest.fn();
            (dispatchArgs.caller: any).errorSaveResources = errorSaveResourcesMock;
            const step22store = UpdateAction.reduceSaveResources(
              object.deepCopy(step1Store),
              dispatchArgs
            );
            test('reduceSaveDrafts update a draft state to `updating`: ' + e.toString(), () => {
              expect(step22store.dataIndex[id]).toBe(0);
              expect(step22store.data).toEqual([
                {
                  id: id,
                  message: 'Updated Message',
                  __state: {
                    error: null,
                    fieldErrors: {},
                    previous: original,
                    status: 'updating'
                  }
                }
              ]);
              expect(errorSaveResourcesMock).toBeCalledWith(
                TestHelper.ModelSettings,
                [error],
                runner._options
              );
            });

            describe('then, update a resource state to error: ' + e.toString(), () => {
              const dispatch = jest.fn();
              const action = new UpdateAction(dispatch);
              action.errorSaveResources(TestHelper.ModelSettings, [error], runner._options);
              const dispatchArgs = ((dispatch.mock
                .calls[0][0]: any): ErrorSaveResourcesDispatchArgs<TestHelper.Model>);
              test(
                'errorSaveResources dispatch a errorSaveResources command: ' + e.toString(),
                () => {
                  expect(dispatchArgs).toEqual({
                    type: ActionType,
                    command: 'errorSaveResources',
                    resourceErrors: [error],
                    settings: TestHelper.ModelSettings,
                    caller: action,
                    requestOptions: runner._options
                  });
                }
              );

              const step221Store = UpdateAction.reduceErrorSaveResources(
                object.deepCopy(step22store),
                dispatchArgs
              );
              test('reduceDoneSaveResources update a resource state: ' + e.toString(), () => {
                expect(step221Store.dataIndex[id]).toBe(0);
                expect(step221Store.data).toEqual([
                  {
                    id: id,
                    message: 'Updated Message',
                    __state: expectedState
                  }
                ]);
              });
            });
          });
        });
      });
    });
  });
});
