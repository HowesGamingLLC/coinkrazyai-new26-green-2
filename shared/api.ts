/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface Wallet {
  goldCoins: number;
  sweepsCoins: number;
}

export interface GCPack {
  id: string;
  price: number;
  goldCoins: number;
  sweepsCoinsBonus: number;
  title: string;
}

export type GameType = 'slots' | 'poker' | 'bingo' | 'sportsbook';

export interface GameInfo {
  id: string;
  type: GameType;
  title: string;
  description: string;
  image: string;
  activePlayers: number;
}

export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'monitoring';
  lastReport: string;
  tasks: string[];
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'win' | 'bet' | 'cashout';
  currency: 'GC' | 'SC';
  amount: number;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
