'use client';

import Image from 'next/image';
import { ButtonHTMLAttributes } from 'react';

import styles from './CoinButton.module.css';

interface CoinButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  hint?: string;
}

export function CoinButton({ label, hint, className, ...props }: CoinButtonProps) {
  const classes = [styles.button, className ?? ''].filter(Boolean).join(' ');
  return (
    <button className={classes} {...props}>
      <span className={styles.coinWrap}>
        <Image src="/blue-icon.png" alt="USDC coin" width={96} height={96} />
      </span>
      <span className={styles.text}>
        <strong>{label}</strong>
        {hint && <span>{hint}</span>}
      </span>
    </button>
  );
}
