'use client';

import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import styles from './TopBar.module.css';

export function TopBar() {
  const { address, isConnected } = useAccount();

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <div className={styles.wrap}>
      <span className={styles.status}>{isConnected ? 'Connected' : 'Not connected'}</span>
      {address && <span className={styles.address}>{shortAddress}</span>}
    </div>
  );
}
