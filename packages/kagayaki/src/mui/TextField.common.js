/* @flow */
import { type Node } from 'react';

type TextFieldProps = {
  classes?: {
    container?: any,
    input?: any,
    inputReadOnly?: any
  },
  defaultValue?: string | number | boolean,
  disabled?: boolean,
  fullWidth?: boolean,
  helperText: string,
  label: string,
  margin: 'none' | 'dense' | 'normal',
  onChange: (v: string | number | boolean) => void,
  placeholder?: string,
  shrink?: boolean,
  value?: string | number | boolean,
  endAdornment?: Node,
  variant?: 'standard' | 'outlined' | 'filled'
};

export type { TextFieldProps };
