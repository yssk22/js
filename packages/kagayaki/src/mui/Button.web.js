/* @flow */
import React from 'react';

import { type ButtonProps } from './Button.common';
import Button from '@material-ui/core/Button/Button';

const _Button = (props: ButtonProps) => {
  return <Button onClick={props.onClick}>{props.children}</Button>;
};

export default _Button;
