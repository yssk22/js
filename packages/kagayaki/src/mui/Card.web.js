/* @flow */

import React from 'react';
import Card from '@material-ui/core/Card/Card';
import type { CardProps } from './Card.common';

const _Card = function(props: CardProps) {
  return <Card {...props}>{props.children}</Card>;
};

export default _Card;
