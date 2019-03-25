/* @flow */
import React, { Component } from 'react';
import { AppRoot, AppScreen } from '@yssk22/kagayaki';
import ConfigScreen from './ui/configs/';
import TaskScreen from './ui/tasks/';

type Props = {};

class App extends Component<Props> {
  render() {
    // TODO: implement ServiceConfig Editor
    // TODO: implement Async Task Manager
    return (
      <AppRoot>
        <div>
          <AppScreen path="/admin/configs/" component={ConfigScreen} />
          <AppScreen path="/admin/tasks/" component={TaskScreen} />
          <AppScreen path="/:service/admin/configs/" component={ConfigScreen} />
          <AppScreen path="/:service/admin/tasks/" component={TaskScreen} />
        </div>
      </AppRoot>
    );
  }
}

export default App;
