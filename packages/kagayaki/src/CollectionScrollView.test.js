/* @flow */
import React from 'react';
import { Text } from 'react-native';
import CollectionScrollView from './CollectionScrollView';
import renderer from 'react-test-renderer';
import { rest } from '@yssk22/utakata';

type TestModel = {
  id: string,
  message: string
};

type TestResource = rest.Resource<TestModel>;

const renderResource = (v: TestResource) => {
  return <Text key={v.id}>{v.message}</Text>;
};

const settings = new rest.ResourceSettings('/foo/');

describe('CollectionScrollView', () => {
  const run = jest.fn();
  jest.spyOn(rest.Action, 'getCollection').mockImplementation(() => {
    return {
      run: run
    };
  });

  test('render while loading', () => {
    const props = rest
      .mockProps(settings)
      .status('reading')
      .mock();
    const component = renderer.create(
      <CollectionScrollView renderResource={renderResource} settings={settings} store={props} />
    );
    expect(rest.Action.getCollection).toHaveBeenCalled();
    expect(run).toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('render after loaded', () => {
    const props = rest
      .mockProps(settings)
      .data({
        id: '123',
        message: 'This is an item'
      })
      .status('none')
      .mock();
    const component = renderer.create(
      <CollectionScrollView renderResource={renderResource} settings={settings} store={props} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  test('render error after loaded', () => {
    const props = rest
      .mockProps(settings)
      .status('none')
      .error('this is error')
      .mock();
    const component = renderer.create(
      <CollectionScrollView renderResource={renderResource} settings={settings} store={props} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
