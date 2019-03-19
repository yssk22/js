/* @flow */
import React from 'react';

import { type ButtonProps } from './IconButton.common';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Cancel from '@material-ui/icons/Cancel';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import Save from '@material-ui/icons/Save';

const iconMap = {
  cancel: Cancel,
  delete: Delete,
  save: Save,
  edit: Edit
};

const iconMapKeys = Object.keys(iconMap);

const _IconButton = (props: ButtonProps) => {
  const Icon = iconMap[props.icon];
  if (Icon === undefined) {
    throw new Error('icon property must be one of ' + iconMapKeys.join(','));
  }
  return (
    <IconButton onClick={props.onClick}>
      <Icon />
    </IconButton>
  );
};

export default _IconButton;
