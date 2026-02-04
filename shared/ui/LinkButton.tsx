import Link from 'next/link';
import { ReactNode } from 'react';

import styles from './Button.module.css';

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
}

export function LinkButton({
  href,
  children,
  variant = 'primary',
  fullWidth,
}: LinkButtonProps) {
  const classes = [
    styles.button,
    variant === 'primary' ? styles.primary : styles.ghost,
    fullWidth ? styles.fullWidth : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}
