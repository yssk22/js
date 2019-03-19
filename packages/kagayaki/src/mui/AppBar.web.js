/* @flow */

import React from 'react';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Typography from '@material-ui/core/Typography/Typography';
import type { AppBarProps } from './AppBar.common';

const _AppBar = function(props: AppBarProps) {
  const { title, ...rest } = props;
  return (
    <AppBar {...rest}>
      {title && (
        <Typography variant="h6" color="textPrimary">
          {title}
        </Typography>
      )}
    </AppBar>
  );
};

export default _AppBar;
