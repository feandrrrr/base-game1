'use client';

import { useMemo } from 'react';
import { useAccount, useConnect } from 'wagmi';

import styles from './TopBar.module.css';

export function TopBar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const baseConnector = useMemo(() => {
    return connectors.find((connector) => connector.id === 'baseAccount') ?? connectors[0];
  }, [connectors]);

  return (
    <div className={styles.wrap}>
      <span className={styles.status}>{isConnected ? 'Connected' : 'Not connected'}</span>
      {address && <span className={styles.address}>{shortAddress}</span>}
      {!isConnected && (
        <button
          type="button"
          className={styles.connect}
          onClick={() => baseConnector && connect({ connector: baseConnector })}
          disabled={!baseConnector || isPending}
        >
          {isPending ? 'Connecting...' : 'Connect wallet'}
        </button>
      )}
    </div>
  );
}
