import { NextResponse } from 'next/server';
import { decodeEventLog, decodeFunctionData, isAddress } from 'viem';

import type { Mode } from '@/entities/player/types';
import { TAP_CONTRACT_ABI, TAP_CONTRACT_ADDRESS } from '@/shared/config/contracts';
import { LIMITS } from '@/shared/config/game';
import { getNextUtcMidnight, getUtcDateKey } from '@/shared/lib/time';
import { basePublicClient } from '@/shared/server/chain';
import {
  canDailyTap,
  getOrCreatePlayer,
  isOnchainTapProcessed,
  storeOnchainTap,
  updatePlayer,
} from '@/shared/server/store';

interface TapRequest {
  fid: string;
  displayName: string;
  mode: Mode;
  txHash?: `0x${string}`;
  walletAddress?: `0x${string}`;
}

function isMode(value: string): value is Mode {
  return value === 'daily' || value === 'rapid';
}

export async function POST(request: Request) {
  const body = (await request.json()) as TapRequest;
  const fid = body?.fid?.trim();
  const displayName = body?.displayName?.trim() || 'Player';
  const mode = body?.mode;

  if (!fid || !mode || !isMode(mode)) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  if (mode === 'daily') {
    const txHash = body?.txHash;
    const walletAddress = body?.walletAddress;
    if (!txHash || !walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json({ message: 'Missing onchain data' }, { status: 400 });
    }
    if (isOnchainTapProcessed(txHash)) {
      return NextResponse.json({ message: 'Tap already recorded' }, { status: 409 });
    }

    const player = getOrCreatePlayer(fid, displayName);
    if (player.walletAddress && player.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ message: 'Wallet mismatch for this player' }, { status: 403 });
    }

    let tx;
    let receipt;
    try {
      receipt = await basePublicClient.getTransactionReceipt({ hash: txHash });
      if (receipt.status !== 'success') {
        return NextResponse.json({ message: 'Transaction failed' }, { status: 400 });
      }
      tx = await basePublicClient.getTransaction({ hash: txHash });
    } catch {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    const hasEvent = receipt?.logs?.some((log) => {
      if (log.address.toLowerCase() !== TAP_CONTRACT_ADDRESS.toLowerCase()) {
        return false;
      }
      try {
        const decodedLog = decodeEventLog({
          abi: TAP_CONTRACT_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decodedLog.eventName !== 'DailyTapped') return false;
        const args = decodedLog.args as { player?: `0x${string}` };
        return args.player?.toLowerCase() === walletAddress.toLowerCase();
      } catch {
        return false;
      }
    });

    if (!hasEvent) {
      return NextResponse.json({ message: 'Tap event not found' }, { status: 400 });
    }

    const todayKey = getUtcDateKey();
    if (!canDailyTap(player)) {
      return NextResponse.json(
        {
          message: 'Daily tap already used',
          nextAvailableAt: getNextUtcMidnight(),
          player,
        },
        { status: 429 }
      );
    }
    const updated = updatePlayer(fid, (current) => ({
      ...current,
      dailyPoints: current.dailyPoints + 1,
      lastDailyTap: todayKey,
      walletAddress: current.walletAddress ?? walletAddress,
    }));
    storeOnchainTap(txHash, fid);
    return NextResponse.json({
      player: updated,
      nextAvailableAt: getNextUtcMidnight(),
    });
  }

  const player = getOrCreatePlayer(fid, displayName);
  const now = Date.now();
  if (player.lastRapidTapAt && now - player.lastRapidTapAt < LIMITS.rapidTapCooldownMs) {
    return NextResponse.json(
      {
        message: 'Too many taps',
        nextAvailableAt: player.lastRapidTapAt + LIMITS.rapidTapCooldownMs,
        player,
      },
      { status: 429 }
    );
  }

  const updated = updatePlayer(fid, (current) => ({
    ...current,
    rapidPoints: current.rapidPoints + 1,
    lastRapidTapAt: now,
  }));

  return NextResponse.json({
    player: updated,
    nextAvailableAt: now + LIMITS.rapidTapCooldownMs,
  });
}
