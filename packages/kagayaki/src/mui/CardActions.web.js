/* @flow */
import React from 'react';
import CardActions from '@material-ui/core/CardActions/CardActions';
import type { CardActionsProps } from './CardActions.common';

const _CardActions = function(props: CardActionsProps) {
  return <CardActions {...props}>{props.children}</CardActions>;
};

export default _CardActions;
