/* @flow */
type ButtonProps = {
  icon: 'save' | 'delete' | 'cancel' | 'edit',
  color?: string,
  disabled?: boolean,
  onClick?: void => void
};

export type { ButtonProps };
