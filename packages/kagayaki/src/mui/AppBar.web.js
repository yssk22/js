/* @flow */

import React from 'react';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Typography from '@material-ui/core/Typography/Typography';
import type { AppBarProps } from './AppBar.common';

const _AppBar = function(props: AppBarProps) {
  const { title, ...rest } = props;
  return (
    <AppBar {...rest}>
      <Toolbar>
        {title && (
          <Typography variant="h6" color="inherit">
            {title}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default _AppBar;
