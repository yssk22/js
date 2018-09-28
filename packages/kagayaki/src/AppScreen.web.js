/* @flow */
import React from 'react';
import { Route } from 'react-router';

type Props = {
  path: string,
  component: any // TODO: must be a React Component
};
export default (props: Props) => {
  return <Route path={props.path} component={props.component} />;
};
