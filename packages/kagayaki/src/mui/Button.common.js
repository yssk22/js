/* @flow */
import { type Node } from 'react';

type ButtonProps = {
  color?: string,
  disabled?: boolean,
  onClick?: void => void,
  children?: Node
};

export type { ButtonProps };
