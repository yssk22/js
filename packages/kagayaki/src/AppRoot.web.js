/* @flow */
import React, { type Node } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { rest } from '@yssk22/utakata';

import theme from './theme';

const store = rest.createStore();
const routerHistory = syncHistoryWithStore(createHistory(), store);

type Props = {
  theme?: { [string]: any },
  children: Node
};

export default class AppRoot extends React.Component<Props> {
  render() {
    const theme_ = Object.assign({}, theme, this.props.theme);
    return (
      <MuiThemeProvider theme={createMuiTheme(theme_)}>
        <Provider store={store}>
          <rest.RestProvider>
            <Router history={routerHistory}>{this.props.children}</Router>
          </rest.RestProvider>
        </Provider>
      </MuiThemeProvider>
    );
  }
}
