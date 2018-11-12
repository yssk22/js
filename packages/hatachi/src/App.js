/* @flow */
import React, { Component } from 'react';
import { AppRoot, AppScreen } from '@yssk22/kagayaki';
import ConfigScreen from './ui/configs/';

type Props = {};

class App extends Component<Props> {
  render() {
    // TODO: implement ServiceConfig Editor
    // TODO: implement Async Task Manager
    return (
      <AppRoot>
        <AppScreen path="/" component={ConfigScreen} />
      </AppRoot>
    );
  }
}

export default App;
