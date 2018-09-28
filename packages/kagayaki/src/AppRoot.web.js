/* @flow */
import React, { type Node } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { events } from '@yssk22/mizuki';
import { rest } from '@yssk22/utakata';

import {
  ApplicationContextProvider,
  type AppData,
  type ServiceConfig,
  type AppAuth
} from './withAppContext';
import theme from './theme';

const ComponentName = 'AppRoot';
const store = rest.createStore();
const routerHistory = syncHistoryWithStore(createHistory(), store);

const parseJSONAttribute = (dom: HTMLElement, attr: string): any => {
  const configJSON = dom.getAttribute(attr);
  if (!configJSON) {
    return {};
  }
  return JSON.parse(configJSON);
};

type Props = {
  theme?: { [string]: any },
  children: Node
};

export default class AppRoot extends React.Component<Props> {
  render() {
    const theme_ = Object.assign({}, theme, this.props.theme);
    const root = document.getElementById('root');
    if (!root) {
      events.fatal(ComponentName, 'no root element is found');
      return null;
    }
    try {
      const appData: AppData = parseJSONAttribute(root, 'data-app');
      const config: ServiceConfig = parseJSONAttribute(root, 'data-config');
      const auth: ?AppAuth = parseJSONAttribute(root, 'data-auth');
      return (
        <ApplicationContextProvider
          value={{
            isDebug: false,
            theme: {},
            appData: appData,
            config: config,
            auth: auth
          }}
        >
          <MuiThemeProvider theme={createMuiTheme(theme_)}>
            <Provider store={store}>
              <rest.RestProvider>
                <Router history={routerHistory}>{this.props.children}</Router>
              </rest.RestProvider>
            </Provider>
          </MuiThemeProvider>
        </ApplicationContextProvider>
      );
    } catch (e) {
      events.fatal(ComponentName, 'failed to render AppRoot', {
        exception: e.toString()
      });
    }
  }
}
