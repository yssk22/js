/* @flow */
import React, { type ComponentType, type ElementConfig } from 'react';

export type AppAuth = ?{
  [string]: any
};

export type AppData = {
  [string]: any
};

export type ServiceConfig = {
  auth_api_base_path: ?string,
  facebook_app_id: ?string,
  facebook_page_id: ?string,
  google_analytics_id: ?string,
  twitter_id: ?string,
  instagram_id: ?string
};

export type AppContext = {
  isDebug: boolean,
  theme: any,
  appData: AppData,
  config: ?ServiceConfig,
  auth: AppAuth
};

const defaultCtx: AppContext = {
  isDebug: true,
  theme: null,
  appData: {},
  config: null,
  auth: null
};

const ApplicationContext = React.createContext(defaultCtx);

export const ApplicationContextProvider = ApplicationContext.Provider;

export function withAppContext<T>(
  Component: ComponentType<T>
): ComponentType<ElementConfig<ComponentType<T>>> {
  return (props: T) => {
    return (
      <ApplicationContext.Consumer>
        {(ctx: AppContext) => {
          if (!ctx.config) {
            throw new Error('AppContext is not initialized property.');
          }
          return <Component {...props} {...ctx} />;
        }}
      </ApplicationContext.Consumer>
    );
  };
}
