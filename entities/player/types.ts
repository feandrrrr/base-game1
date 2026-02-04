export type Mode = 'daily' | 'rapid';

export interface PlayerRecord {
  fid: string;
  displayName: string;
  walletAddress?: string;
  dailyPoints: number;
  rapidPoints: number;
  lastDailyTap?: string;
  lastRapidTapAt?: number;
}

export interface LeaderboardEntry {
  fid: string;
  displayName: string;
  points: number;
}
