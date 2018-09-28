/* @flow */
import { object } from '@yssk22/mizuki';
import { ActionType } from './Action';
import {
  CreateAction,
  type CreateDraftDispatchArgs,
  type SaveDraftsDispatchArgs,
  type DoneSaveDraftsDispatchArgs,
  type ErrorSaveDraftsDispatchArgs
} from './CreateAction';
import * as TestHelper from './TestHelper';
jest.mock('./request');

describe('rest.Create', () => {
  const step0Store = TestHelper.genStore([]);
  describe('step 1. create a draft', () => {
    const dispatch = jest.fn();
    const action = new CreateAction(dispatch);
    const id = action.createDraft(TestHelper.ModelSettings);
    const dispatchArgs = ((dispatch.mock.calls[0][0]: any): CreateDraftDispatchArgs<
      TestHelper.Model
    >);
    test('createDraft dispatch a createDraft command', () => {
      expect(dispatchArgs).toEqual({
        type: ActionType,
        command: 'createDraft',
        targets: [id],
        settings: TestHelper.ModelSettings,
        caller: action
      });
    });

    const step1Store = CreateAction.reduceCreateDraft(object.deepCopy(step0Store), dispatchArgs);
    test('reduceCreateDraft creates a draft in store', () => {
      expect(step1Store.draftIndex[id]).toBe(0);
      expect(step1Store.drafts).toEqual([
        {
          id: id,
          message: 'default message',
          __state: {
            error: null,
            fieldErrors: {},
            previous: null,
            status: 'draft'
          }
        }
      ]);
    });

    describe('step 2. save a draft', () => {
      const dispatch = jest.fn();
      const action = new CreateAction(dispatch);
      const runner = action.saveDrafts(TestHelper.ModelSettings, id);
      runner.run();
      const dispatchArgs = ((dispatch.mock.calls[0][0]: any): SaveDraftsDispatchArgs<
        TestHelper.Model
      >);
      test('saveDrafts dispatch a createDraft command', () => {
        expect(dispatchArgs).toEqual({
          type: ActionType,
          command: 'saveDrafts',
          targets: [id],
          settings: TestHelper.ModelSettings,
          caller: action,
          requestOptions: runner._options
        });
      });

      describe('step 2-1. success', () => {
        const serverAssignedID = '123';
        const created = {
          id: serverAssignedID,
          message: 'default message'
        };
        TestHelper.mockResponse('POST', created);
        const doneSaveDraftsMock = jest.fn();
        (dispatchArgs.caller: any).doneSaveDrafts = doneSaveDraftsMock;
        const step21Store = CreateAction.reduceSaveDrafts(
          object.deepCopy(step1Store),
          dispatchArgs
        );
        test('reduceSaveDrafts update a draft state to `creating`', () => {
          expect(step21Store.draftIndex[id]).toBe(0);
          expect(step21Store.drafts).toEqual([
            {
              id: id,
              message: 'default message',
              __state: {
                error: null,
                fieldErrors: {},
                previous: null,
                status: 'creating'
              }
            }
          ]);
          expect(doneSaveDraftsMock).toBeCalledWith(
            TestHelper.ModelSettings,
            [created],
            [id],
            runner._options
          );
        });

        describe('then, remove a draft and add a resource', () => {
          const dispatch = jest.fn();
          const action = new CreateAction(dispatch);
          action.doneSaveDrafts(TestHelper.ModelSettings, [created], [id], runner._options);
          const dispatchArgs = ((dispatch.mock.calls[0][0]: any): DoneSaveDraftsDispatchArgs<
            TestHelper.Model
          >);
          test('doneSaveDrafts dispatch a doneSaveDrafts command', () => {
            expect(dispatchArgs).toEqual({
              type: ActionType,
              command: 'doneSaveDrafts',
              resources: [created],
              settings: TestHelper.ModelSettings,
              deletes: [id],
              caller: action,
              requestOptions: runner._options
            });
          });

          const step211Store = CreateAction.reduceDoneSaveDrafts(
            object.deepCopy(step21Store),
            dispatchArgs
          );
          test('reduceDoneSaveDrafts remove a draft and add a resource', () => {
            expect(step211Store.draftIndex).toEqual({});
            expect(step211Store.drafts).toEqual([]);
            expect(step211Store.dataIndex[serverAssignedID]).toBe(0);
            expect(step211Store.data).toEqual([
              Object.assign({}, created, {
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
            previous: null,
            status: 'draft'
          },
          {
            error: TestHelper.ExpectedFieldErrors.toString(),
            fieldErrors: TestHelper.ExpectedFieldErrors.fields,
            previous: null,
            status: 'draft'
          },
          {
            error: TestHelper.ExpectedUnknownError.toString(),
            fieldErrors: {},
            previous: null,
            status: 'draft'
          }
        ];

        errors.forEach((e, i) => {
          TestHelper.mockErrrorResponse('POST', e);
          const error = {
            id: id,
            error: e
          };
          const expectedState = states[i];
          const errorSaveDraftsMock = jest.fn();
          (dispatchArgs.caller: any).errorSaveDrafts = errorSaveDraftsMock;
          const step22Store = CreateAction.reduceSaveDrafts(
            object.deepCopy(step1Store),
            dispatchArgs
          );
          test('reduceSaveDrafts update a draft state to `creating`: ' + e.toString(), () => {
            expect(step22Store.draftIndex[id]).toBe(0);
            expect(step22Store.drafts).toEqual([
              {
                id: id,
                message: 'default message',
                __state: {
                  error: null,
                  fieldErrors: {},
                  previous: null,
                  status: 'creating'
                }
              }
            ]);
            expect(errorSaveDraftsMock).toBeCalledWith(
              TestHelper.ModelSettings,
              [error],
              runner._options
            );
          });

          describe('then, update a draft state to error: ' + e.toString(), () => {
            const dispatch = jest.fn();
            const action = new CreateAction(dispatch);
            action.errorSaveDrafts(TestHelper.ModelSettings, [error], runner._options);
            const dispatchArgs = ((dispatch.mock.calls[0][0]: any): ErrorSaveDraftsDispatchArgs<
              TestHelper.Model
            >);
            test('errorSaveDrafts dispatch a errorSaveDrafts command: ' + e.toString(), () => {
              expect(dispatchArgs).toEqual({
                type: ActionType,
                command: 'errorSaveDrafts',
                resourceErrors: [error],
                settings: TestHelper.ModelSettings,
                caller: action,
                requestOptions: runner._options
              });
            });

            const step221Store = CreateAction.reduceErrorSaveDrafts(
              object.deepCopy(step22Store),
              dispatchArgs
            );
            test('reduceDoneSaveDrafts updates a draft state: ' + e.toString(), () => {
              expect(step221Store.draftIndex[id]).toBe(0);
              expect(step221Store.drafts).toEqual([
                {
                  id: id,
                  message: 'default message',
                  __state: expectedState
                }
              ]);
              expect(step221Store.data).toEqual([]);
            });
          });
        });
      });
    });
  });
});
