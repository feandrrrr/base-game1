'use client';

import { useEffect, useMemo, useState } from 'react';

import { useMiniApp } from '@/app/providers/MiniAppProvider';
import type { PlayerRecord } from '@/entities/player/types';
import { TAP_CONTRACT_ABI, TAP_CONTRACT_ADDRESS } from '@/shared/config/contracts';
import { REWARD_POOLS } from '@/shared/config/game';
import { wagmiConfig } from '@/shared/config/wagmi';
import { getClientId } from '@/shared/lib/clientId';
import { Button } from '@/shared/ui/Button';
import { CoinButton } from '@/shared/ui/CoinButton';
import { getCapabilities, sendCalls, waitForCallsStatus } from '@wagmi/core';
import { encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { useAccount } from 'wagmi';

import { DailyAnimation } from './DailyAnimation';
import styles from './DailyTap.module.css';

export function DailyTap() {
  const { context } = useMiniApp();
  const [player, setPlayer] = useState<PlayerRecord | null>(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();

  const fid = useMemo(() => {
    return context?.user?.fid ? String(context.user.fid) : getClientId();
  }, [context?.user?.fid]);

  const displayName = useMemo(() => {
    return context?.user?.displayName || context?.user?.username || 'Guest';
  }, [context?.user?.displayName, context?.user?.username]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/leaderboard?mode=daily&fid=${fid}`);
      const data = await res.json();
      if (data?.player) {
        setPlayer(data.player);
      }
    };
    load();
  }, [fid]);

  const handleTap = async () => {
    setError('');
    setDebugInfo(null);
    setIsLoading(true);
    try {
      if (!address) {
        setError('Connect your wallet in the Base app to tap onchain.');
        return;
      }
      if (TAP_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setError('Tap contract address is not configured.');
        return;
      }
      const capabilities = await getCapabilities(wagmiConfig, { account: address });
      const baseCapabilities = capabilities[base.id];
      const supportsPaymaster = baseCapabilities?.paymasterService?.supported;
      const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
      const paymasterHost = paymasterUrl ? new URL(paymasterUrl).host : 'missing';
      const debugLine = `contract=${TAP_CONTRACT_ADDRESS} paymaster=${paymasterHost} supported=${Boolean(
        supportsPaymaster
      )}`;
      setDebugInfo(debugLine);
      console.info('Daily tap debug:', debugLine);
      if (!supportsPaymaster || !paymasterUrl) {
        setError('Paymaster is not configured. Open the app inside Base and set the Paymaster URL.');
        return;
      }

      const { id } = await sendCalls(wagmiConfig, {
        account: address,
        chainId: base.id,
        calls: [
          {
            to: TAP_CONTRACT_ADDRESS,
            data: encodeFunctionData({
              abi: TAP_CONTRACT_ABI,
              functionName: 'tap',
            }),
            value: 0n,
          },
        ],
        capabilities: {
          paymasterService: {
            url: paymasterUrl,
          },
        },
      });

      const status = await waitForCallsStatus(wagmiConfig, {
        id,
        pollingInterval: 1500,
        timeout: 120_000,
      });

      const txHash = status.receipts?.[0]?.transactionHash;
      if (!txHash) {
        setError('Transaction hash not found.');
        return;
      }

      const res = await fetch('/api/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid,
          displayName,
          mode: 'daily',
          txHash,
          walletAddress: address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || 'Tap failed.');
        return;
      }
      setPlayer(data.player);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Daily tap failed', err);
      setError(`Onchain transaction failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const canTap = true;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <p className={styles.kicker}>Onchain • Once per day</p>
        <h2>Tap the USDC coin once per day</h2>
        <p className={styles.subtitle}>
          Each valid daily tap adds 1 point to your onchain leaderboard. Rewards are manual payouts.
        </p>
      </header>

      <DailyAnimation />

      <CoinButton
        label="Claim daily onchain tap"
        hint="1 point on success"
        disabled={!canTap || isLoading}
        onClick={handleTap}
      />

      {error && <p className={styles.error}>{error}</p>}
      {debugInfo && <p className={styles.debug}>{debugInfo}</p>}

      <div className={styles.stats}>
        <div>
          <span>Your daily points</span>
          <strong>{player?.dailyPoints ?? 0}</strong>
        </div>
        <div>
          <span>Season prize pool</span>
          <strong>{REWARD_POOLS.dailyTotal} USDC</strong>
        </div>
      </div>

      <div className={styles.cta}>
        <Button variant="ghost" onClick={() => history.back()}>
          Back to menu
        </Button>
      </div>
    </section>
  );
}
