/* @flow */
import React from 'react';
import TextField from '@material-ui/core/TextField/TextField';
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment';
import type { TextFieldProps } from './TextField.common';
import { withStyles } from '@material-ui/core/styles/index';

const styles = theme => {
  return {
    container: {},
    input: {
      // To calculate input width with 100%, use border-box for boxSizing
      boxSizing: 'border-box'
    },
    inputReadOnly: {}
  };
};

const _TextField = function(props: TextFieldProps) {
  const { classes, shrink, endAdornment, ...rest } = props;
  let onChange = undefined;
  if (props.onChange) {
    onChange = ev => {
      props.onChange(ev.target.value);
    };
  }
  const c = classes || {};
  return (
    <TextField
      className={c.container}
      {...rest}
      onChange={onChange}
      InputProps={{
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : null
      }}
      inputProps={{
        className: c.input
      }}
      InputLabelProps={{
        shrink: shrink
      }}
    />
  );
};

export default withStyles(styles)(_TextField);
