/* @flow */
import React from 'react';
import { Text } from 'react-native';
import ScrollViewList from './ScrollViewList';
import renderer from 'react-test-renderer';

describe('ScrollViewList', () => {
  test('render', () => {
    const component = renderer.create(
      <ScrollViewList
        data={[{ a: 1 }]}
        childComponentFunc={(v, idx) => {
          return <Text key={idx}>{v.a}</Text>;
        }}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
