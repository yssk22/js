/* @flow */
import React from 'react';
import Done from '@material-ui/icons/Done';
import Error from '@material-ui/icons/Error';
import Schedule from '@material-ui/icons/Schedule';
import HelpOutline from '@material-ui/icons/HelpOutline';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import { type IconProps } from './Icon.common';

const iconMap = {
  success: <Done color="primary" />,
  failure: <Error color="error" />,
  running: <CircularProgress color="secondary" size={22} />,
  schedule: <Schedule color="secondary" />,
  unknown: <HelpOutline color="disabled" />
};

const iconMapKeys = Object.keys(iconMap);

const _IconButton = (props: IconProps) => {
  const Icon = iconMap[props.icon];
  if (Icon === undefined) {
    throw new Error('icon property must be one of ' + iconMapKeys.join(','));
  }
  return Icon;
};

export default _IconButton;
