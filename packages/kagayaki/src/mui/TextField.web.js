/* @flow */
import React from 'react';
import TextField from '@material-ui/core/TextField/TextField';
import type { TextFieldProps } from './TextField.common';
import { withStyles } from '@material-ui/core/styles/index';

const styles = theme => {
  return {
    container: {},
    input: {
      // To calculate input width with 100%, use border-box for boxSizing
      boxSizing: 'border-box'
    },
    inputReadOnly: {
      backgroundColor: '#eeeeee'
    }
  };
};

const _TextField = function(props: TextFieldProps) {
  const { classes, ...rest } = props;
  let onChange = undefined;
  if (props.onChange) {
    onChange = ev => {
      props.onChange(ev.target.value);
    };
  }
  const c = classes || {};
  const inputClass = [c.input];
  if (props.readOnly) {
    inputClass.push(c.inputReadOnly);
  }
  console.log(inputClass);
  return (
    <TextField
      className={c.container}
      {...rest}
      onChange={onChange}
      inputProps={{
        className: inputClass,
        readOnly: props.readOnly || false
      }}
    />
  );
};

export default withStyles(styles)(_TextField);
