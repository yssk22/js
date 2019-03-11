/* @flow */

type TextFieldProps = {
  classes?: {
    container?: any,
    input?: any,
    inputReadOnly?: any
  },
  defaultValue?: string | number | boolean,
  fullWidth?: boolean,
  readOnly?: boolean,
  helperText: string,
  label: string,
  onChange: (v: string | number | boolean) => void,
  value?: string | number | boolean
};

export type { TextFieldProps };
