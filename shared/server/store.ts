import fs from 'fs';
import path from 'path';

import Database from 'better-sqlite3';

import type { LeaderboardEntry, Mode, PlayerRecord } from '@/entities/player/types';
import { getUtcDateKey } from '@/shared/lib/time';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'leaderboard.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    fid TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    wallet_address TEXT,
    daily_points INTEGER NOT NULL DEFAULT 0,
    rapid_points INTEGER NOT NULL DEFAULT 0,
    last_daily_tap TEXT,
    last_rapid_tap_at INTEGER
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS onchain_taps (
    tx_hash TEXT PRIMARY KEY,
    fid TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

try {
  db.exec('ALTER TABLE players ADD COLUMN wallet_address TEXT');
} catch {
  // ignore if column already exists
}

export function getOrCreatePlayer(fid: string, displayName: string) {
  const row = db
    .prepare(
      `SELECT fid as fid,
              display_name as displayName,
              wallet_address as walletAddress,
              daily_points as dailyPoints,
              rapid_points as rapidPoints,
              last_daily_tap as lastDailyTap,
              last_rapid_tap_at as lastRapidTapAt
       FROM players WHERE fid = ?`
    )
    .get(fid) as PlayerRecord | undefined;

  if (row) {
    if (displayName && row.displayName !== displayName) {
      db.prepare('UPDATE players SET display_name = ? WHERE fid = ?').run(displayName, fid);
      row.displayName = displayName;
    }
    return row;
  }

  const created: PlayerRecord = {
    fid,
    displayName: displayName || 'Player',
    dailyPoints: 0,
    rapidPoints: 0,
  };
  db.prepare(
    `INSERT INTO players (fid, display_name, wallet_address, daily_points, rapid_points)
     VALUES (?, ?, ?, 0, 0)`
  ).run(created.fid, created.displayName, null);

  return created;
}

export function updatePlayer(
  fid: string,
  updater: (player: PlayerRecord) => PlayerRecord
) {
  const player = getOrCreatePlayer(fid, 'Player');
  const updated = updater(player);

  db.prepare(
    `UPDATE players
     SET display_name = ?,
         wallet_address = ?,
         daily_points = ?,
         rapid_points = ?,
         last_daily_tap = ?,
         last_rapid_tap_at = ?
     WHERE fid = ?`
  ).run(
    updated.displayName,
    updated.walletAddress ?? null,
    updated.dailyPoints,
    updated.rapidPoints,
    updated.lastDailyTap ?? null,
    updated.lastRapidTapAt ?? null,
    fid
  );

  return updated;
}

export function getLeaderboard(mode: Mode, limit = 50): LeaderboardEntry[] {
  const field = mode === 'daily' ? 'daily_points' : 'rapid_points';
  const rows = db
    .prepare(
      `SELECT fid, display_name as displayName, ${field} as points
       FROM players
       ORDER BY ${field} DESC, display_name ASC
       LIMIT ?`
    )
    .all(limit) as Array<LeaderboardEntry & { displayName: string }>;

  return rows.map((row) => ({
    fid: row.fid,
    displayName: row.displayName,
    points: row.points,
  }));
}

export function getPlayerSnapshot(fid?: string) {
  if (!fid) return null;
  const row = db
    .prepare(
      `SELECT fid as fid,
              display_name as displayName,
              wallet_address as walletAddress,
              daily_points as dailyPoints,
              rapid_points as rapidPoints,
              last_daily_tap as lastDailyTap,
              last_rapid_tap_at as lastRapidTapAt
       FROM players WHERE fid = ?`
    )
    .get(fid) as PlayerRecord | undefined;
  return row ?? null;
}

export function canDailyTap(player: PlayerRecord, now = new Date()) {
  return player.lastDailyTap !== getUtcDateKey(now);
}

export function isOnchainTapProcessed(txHash: string) {
  const row = db.prepare('SELECT tx_hash FROM onchain_taps WHERE tx_hash = ?').get(txHash);
  return Boolean(row);
}

export function storeOnchainTap(txHash: string, fid: string) {
  db.prepare('INSERT INTO onchain_taps (tx_hash, fid, created_at) VALUES (?, ?, ?)').run(
    txHash,
    fid,
    new Date().toISOString()
  );
}
