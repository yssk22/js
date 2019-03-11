/* @flow */
import React from 'react';
import List from '@material-ui/core/List/List';
import type { ListProps } from './List.common';

const _List = function(props: ListProps) {
  return <List>{props.children}</List>;
};

export default _List;
