import { ButtonHTMLAttributes } from 'react';

import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth, className, ...props }: ButtonProps) {
  const classes = [
    styles.button,
    variant === 'primary' ? styles.primary : styles.ghost,
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} {...props} />;
}
