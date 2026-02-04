'use client';

import { useEffect, useMemo, useState } from 'react';

import { useMiniApp } from '@/app/providers/MiniAppProvider';
import type { LeaderboardEntry, PlayerRecord } from '@/entities/player/types';
import { REWARD_POOLS } from '@/shared/config/game';
import { getClientId } from '@/shared/lib/clientId';
import { Button } from '@/shared/ui/Button';

import styles from './Leaderboards.module.css';

interface LeaderboardPayload {
  daily: LeaderboardEntry[];
  rapid: LeaderboardEntry[];
  player: PlayerRecord | null;
}

export function Leaderboards() {
  const { context } = useMiniApp();
  const [data, setData] = useState<LeaderboardPayload | null>(null);

  const fid = useMemo(() => {
    return context?.user?.fid ? String(context.user.fid) : getClientId();
  }, [context?.user?.fid]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/leaderboard?mode=all&fid=${fid}`);
      const payload = (await res.json()) as LeaderboardPayload;
      setData(payload);
    };
    load();
  }, [fid]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <p className={styles.kicker}>Season rewards</p>
        <h2>Leaderboards</h2>
        <p className={styles.subtitle}>Rewards are paid manually to top players.</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Daily onchain taps</h3>
          <p className={styles.pool}>Season prize pool: {REWARD_POOLS.dailyTotal} USDC</p>
          <ul className={styles.places}>
            {REWARD_POOLS.dailyPlaces.map((place) => (
              <li key={`daily-${place.place}`}>
                #{place.place} — {place.amount} USDC
              </li>
            ))}
          </ul>
          <LeaderboardTable entries={data?.daily ?? []} highlightFid={fid} />
        </div>

        <div className={styles.card}>
          <h3>Rapid tap sprint</h3>
          <p className={styles.pool}>Season prize pool: {REWARD_POOLS.rapidTotal} USDC</p>
          <ul className={styles.places}>
            {REWARD_POOLS.rapidPlaces.map((place) => (
              <li key={`rapid-${place.place}`}>
                #{place.place} — {place.amount} USDC
              </li>
            ))}
          </ul>
          <LeaderboardTable entries={data?.rapid ?? []} highlightFid={fid} />
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

function LeaderboardTable({
  entries,
  highlightFid,
}: {
  entries: LeaderboardEntry[];
  highlightFid: string;
}) {
  if (!entries.length) {
    return <p className={styles.empty}>No taps yet. Be the first.</p>;
  }

  return (
    <div className={styles.table}>
      {entries.map((entry, index) => (
        <div
          key={entry.fid}
          className={`${styles.row} ${entry.fid === highlightFid ? styles.highlight : ''}`}
        >
          <span>#{index + 1}</span>
          <span>{entry.displayName}</span>
          <span>{entry.points}</span>
        </div>
      ))}
    </div>
  );
}
