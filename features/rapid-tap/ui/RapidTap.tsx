'use client';

import { useEffect, useMemo, useState } from 'react';

import { useMiniApp } from '@/app/providers/MiniAppProvider';
import type { PlayerRecord } from '@/entities/player/types';
import { REWARD_POOLS } from '@/shared/config/game';
import { getClientId } from '@/shared/lib/clientId';
import { formatCountdown } from '@/shared/lib/time';
import { Button } from '@/shared/ui/Button';
import { CoinButton } from '@/shared/ui/CoinButton';

import styles from './RapidTap.module.css';

export function RapidTap() {
  const { context } = useMiniApp();
  const [player, setPlayer] = useState<PlayerRecord | null>(null);
  const [error, setError] = useState('');
  const [nextAvailableAt, setNextAvailableAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const fid = useMemo(() => {
    return context?.user?.fid ? String(context.user.fid) : getClientId();
  }, [context?.user?.fid]);

  const displayName = useMemo(() => {
    return context?.user?.displayName || context?.user?.username || 'Guest';
  }, [context?.user?.displayName, context?.user?.username]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/leaderboard?mode=rapid&fid=${fid}`);
      const data = await res.json();
      if (data?.player) {
        setPlayer(data.player);
      }
    };
    load();
  }, [fid]);

  const handleTap = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid, displayName, mode: 'rapid' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || 'Tap failed.');
        if (data?.nextAvailableAt) {
          setNextAvailableAt(data.nextAvailableAt);
        }
        return;
      }
      setPlayer(data.player);
      setNextAvailableAt(data.nextAvailableAt ?? null);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canTap = !nextAvailableAt || nextAvailableAt <= now;
  const countdown = nextAvailableAt ? formatCountdown(nextAvailableAt - now) : null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <p className={styles.kicker}>Offchain • Every second</p>
        <h2>Tap as fast as you can</h2>
        <p className={styles.subtitle}>
          Rapid taps are recorded offchain. You can tap once every second to climb the leaderboard.
        </p>
      </header>

      <CoinButton
        label={canTap ? 'Tap now' : 'Cooling down'}
        hint={canTap ? '1 point per tap' : `Next tap in ${countdown}`}
        disabled={!canTap || isLoading}
        onClick={handleTap}
      />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.stats}>
        <div>
          <span>Your rapid points</span>
          <strong>{player?.rapidPoints ?? 0}</strong>
        </div>
        <div>
          <span>Season prize pool</span>
          <strong>{REWARD_POOLS.rapidTotal} USDC</strong>
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
