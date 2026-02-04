import { NextResponse } from 'next/server';

import type { Mode } from '@/entities/player/types';
import { REWARD_POOLS } from '@/shared/config/game';
import { getLeaderboard, getPlayerSnapshot } from '@/shared/server/store';

function isMode(value: string): value is Mode {
  return value === 'daily' || value === 'rapid';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get('mode') ?? 'all';
  const fid = searchParams.get('fid') ?? undefined;

  if (modeParam === 'all') {
    return NextResponse.json({
      daily: getLeaderboard('daily'),
      rapid: getLeaderboard('rapid'),
      pools: REWARD_POOLS,
      player: getPlayerSnapshot(fid),
    });
  }

  if (!isMode(modeParam)) {
    return NextResponse.json({ message: 'Invalid mode' }, { status: 400 });
  }

  return NextResponse.json({
    entries: getLeaderboard(modeParam),
    pool: modeParam === 'daily' ? REWARD_POOLS.dailyTotal : REWARD_POOLS.rapidTotal,
    places: modeParam === 'daily' ? REWARD_POOLS.dailyPlaces : REWARD_POOLS.rapidPlaces,
    player: getPlayerSnapshot(fid),
  });
}
