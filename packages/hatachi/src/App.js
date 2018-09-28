/* @flow */
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { AppRoot, AppScreen, ScrollViewList } from '@yssk22/kagayaki';

type Props = {};

const C = () => {
  return (
    <ScrollViewList
      refreshing={false}
      data={[{ a: 1 }]}
      childComponentFunc={(v, idx) => {
        return (
          <View key={idx}>
            <Text>{v.a}</Text>
          </View>
        );
      }}
    />
  );
};

class App extends Component<Props> {
  render() {
    // TODO: implement ServiceConfig Editor
    // TODO: implement Async Task Manager
    return (
      <AppRoot>
        <AppScreen path="/" component={C} />
      </AppRoot>
    );
  }
}

export default App;
