/* @flow */
import React from 'react';
import { Text } from 'react-native';
import ScrollView from './ScrollView';
import renderer from 'react-test-renderer';

describe('ScrollView', () => {
  test('render', () => {
    const component = renderer.create(
      <ScrollView
        data={[{ a: 1 }]}
        childComponentFunc={(v, idx) => {
          return <Text key={idx}>{v.a}</Text>;
        }}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
