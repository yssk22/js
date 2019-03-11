/* @flow */

import React from 'react';
import CardContent from '@material-ui/core/CardContent/CardContent';
import type { CardContentProps } from './CardContent.common';

const _CardContent = function(props: CardContentProps) {
  return <CardContent {...props}>{props.children}</CardContent>;
};

export default _CardContent;
