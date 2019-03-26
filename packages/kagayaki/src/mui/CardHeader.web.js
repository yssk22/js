/* @flow */

import React from 'react';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import type { CardHeaderProps } from './CardHeader.common';

const _CardHeader = function(props: CardHeaderProps) {
  const { subtitle, ...rest } = props;
  return <CardHeader {...rest} subheader={subtitle} />;
};

export default _CardHeader;
