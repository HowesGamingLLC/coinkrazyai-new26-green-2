import { RequestHandler } from "express";

interface PokerTable {
  id: string;
  name: string;
  minBuyIn: number;
  maxBuyIn: number;
  players: number;
  maxPlayers: number;
  status: 'active' | 'waiting';
}

const POKER_TABLES: PokerTable[] = [
  { id: 'table-1', name: 'High Roller Room', minBuyIn: 100, maxBuyIn: 1000, players: 5, maxPlayers: 8, status: 'active' },
  { id: 'table-2', name: 'The Shark Tank', minBuyIn: 50, maxBuyIn: 500, players: 8, maxPlayers: 8, status: 'active' },
  { id: 'table-3', name: 'Casual Grind', minBuyIn: 10, maxBuyIn: 100, players: 3, maxPlayers: 8, status: 'waiting' },
  { id: 'table-4', name: 'Midnight Poker', minBuyIn: 200, maxBuyIn: 2000, players: 2, maxPlayers: 8, status: 'active' },
  { id: 'table-5', name: 'AI Elite', minBuyIn: 500, maxBuyIn: 5000, players: 1, maxPlayers: 8, status: 'waiting' },
];

export const handleGetPokerTables: RequestHandler = (req, res) => {
  res.json({ success: true, data: POKER_TABLES });
};

export const handleJoinTable: RequestHandler = (req, res) => {
  const { tableId, buyIn } = req.body;
  const table = POKER_TABLES.find(t => t.id === tableId);

  if (!table) {
    return res.status(404).json({ success: false, error: "Table not found" });
  }

  if (table.players >= table.maxPlayers) {
    return res.status(400).json({ success: false, error: "Table is full" });
  }

  res.json({ 
    success: true, 
    data: { 
      message: "Joined table successfully",
      gameState: {
        pot: 0,
        cards: [],
        myCards: ['A♠', 'K♠']
      }
    } 
  });
};
