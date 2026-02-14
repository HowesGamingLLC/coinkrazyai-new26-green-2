import { RequestHandler } from "express";
import { WalletService } from "../services/wallet-service";

const DEFAULT_USER = 'default-user';

interface PokerTable {
  id: string;
  name: string;
  minBuyIn: number;
  maxBuyIn: number;
  players: number;
  maxPlayers: number;
  status: 'active' | 'waiting';
  currentBet: number;
  pot: number;
}

// Game configuration
let gameConfig = {
  rtp: 95,
  minBuyIn: 10,
  maxBuyIn: 1000,
  houseCommission: 5, // percentage
};

// In-memory active tables
let activeTables: Record<string, PokerTable> = {
  'table-1': { id: 'table-1', name: 'High Roller Room', minBuyIn: 100, maxBuyIn: 1000, players: 5, maxPlayers: 8, status: 'active', currentBet: 50, pot: 500 },
  'table-2': { id: 'table-2', name: 'The Shark Tank', minBuyIn: 50, maxBuyIn: 500, players: 8, maxPlayers: 8, status: 'active', currentBet: 25, pot: 250 },
  'table-3': { id: 'table-3', name: 'Casual Grind', minBuyIn: 10, maxBuyIn: 100, players: 3, maxPlayers: 8, status: 'waiting', currentBet: 5, pot: 0 },
  'table-4': { id: 'table-4', name: 'Midnight Poker', minBuyIn: 200, maxBuyIn: 2000, players: 2, maxPlayers: 8, status: 'active', currentBet: 100, pot: 1000 },
  'table-5': { id: 'table-5', name: 'AI Elite', minBuyIn: 500, maxBuyIn: 5000, players: 1, maxPlayers: 8, status: 'waiting', currentBet: 250, pot: 0 },
};

export const handleGetPokerTables: RequestHandler = (req, res) => {
  try {
    const tables = Object.values(activeTables);
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get tables' });
  }
};

export const handleJoinTable: RequestHandler = async (req, res) => {
  try {
    const { tableId, buyIn } = req.body;
    const table = activeTables[tableId];

    if (!table) {
      return res.status(404).json({ success: false, error: "Table not found" });
    }

    if (table.players >= table.maxPlayers) {
      return res.status(400).json({ success: false, error: "Table is full" });
    }

    if (buyIn < table.minBuyIn || buyIn > table.maxBuyIn) {
      return res.status(400).json({ 
        success: false, 
        error: `Buy-in must be between ${table.minBuyIn} and ${table.maxBuyIn}` 
      });
    }

    // Check wallet
    const wallet = WalletService.getWallet(DEFAULT_USER);
    if (wallet.goldCoins < buyIn) {
      return res.status(400).json({ success: false, error: "Insufficient Gold Coins" });
    }

    // Deduct buy-in
    const result = await WalletService.updateBalance(DEFAULT_USER, 'GC', -buyIn, 'bet');
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    // Increment player count (simulate)
    if (table.status === 'waiting' && table.players < 2) {
      table.status = 'active';
    }
    table.players += 1;

    // Generate mock player cards
    const cards = ['A♠', 'K♠'];
    const otherPlayers = Array.from({ length: Math.min(table.players - 1, 7) }).map((_, i) => ({
      name: `Player ${i + 1}`,
      stack: Math.floor(Math.random() * 500) + 100,
      status: 'active'
    }));

    res.json({ 
      success: true, 
      data: { 
        message: "Joined table successfully",
        table,
        gameState: {
          myStack: buyIn,
          pot: table.pot,
          currentBet: table.currentBet,
          myCards: cards,
          myPosition: Math.floor(Math.random() * table.players),
          otherPlayers,
          phase: 'pre-flop'
        },
        wallet: result.wallet
      } 
    });
  } catch (error) {
    console.error('Join table error:', error);
    res.status(500).json({ success: false, error: 'Failed to join table' });
  }
};

export const handleFold: RequestHandler = async (req, res) => {
  try {
    const { tableId, stackRemaining } = req.body;
    const table = activeTables[tableId];

    if (!table) {
      return res.status(404).json({ success: false, error: "Table not found" });
    }

    // Return remaining stack to player
    if (stackRemaining > 0) {
      await WalletService.updateBalance(DEFAULT_USER, 'GC', stackRemaining, 'win');
    }

    res.json({ 
      success: true, 
      data: { 
        message: "You folded",
        stackReturned: stackRemaining,
        wallet: WalletService.getWallet(DEFAULT_USER)
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fold' });
  }
};

export const handleGetConfig: RequestHandler = (req, res) => {
  res.json({ success: true, data: gameConfig });
};

export const handleUpdateConfig: RequestHandler = (req, res) => {
  const { rtp, minBuyIn, maxBuyIn, houseCommission } = req.body;

  if (rtp !== undefined && rtp > 0 && rtp <= 100) {
    gameConfig.rtp = rtp;
  }
  if (minBuyIn !== undefined && minBuyIn > 0) {
    gameConfig.minBuyIn = minBuyIn;
  }
  if (maxBuyIn !== undefined && maxBuyIn > gameConfig.minBuyIn) {
    gameConfig.maxBuyIn = maxBuyIn;
  }
  if (houseCommission !== undefined && houseCommission >= 0 && houseCommission <= 50) {
    gameConfig.houseCommission = houseCommission;
  }

  // Update all tables
  Object.values(activeTables).forEach(table => {
    table.minBuyIn = gameConfig.minBuyIn;
    table.maxBuyIn = gameConfig.maxBuyIn;
  });

  res.json({ success: true, data: gameConfig });
};
