import { RequestHandler } from "express";
import { WalletService } from "../services/wallet-service";

const DEFAULT_USER = 'default-user';

interface BingoRoom {
  id: string;
  name: string;
  ticketPrice: number;
  jackpot: number;
  players: number;
  nextGameIn: number;
}

// Game configuration
let gameConfig = {
  rtp: 85,
  minTicketPrice: 0.5,
  maxTicketPrice: 50,
  houseCommission: 15, // percentage
};

let bingoRooms: Record<string, BingoRoom> = {
  'room-1': { id: 'room-1', name: 'Neon Nights', ticketPrice: 1, jackpot: 500, players: 120, nextGameIn: 45 },
  'room-2': { id: 'room-2', name: 'Golden Galaxy', ticketPrice: 5, jackpot: 2500, players: 45, nextGameIn: 120 },
  'room-3': { id: 'room-3', name: 'AI Arena', ticketPrice: 0.5, jackpot: 100, players: 300, nextGameIn: 15 },
  'room-4': { id: 'room-4', name: 'Krazy Jackpot', ticketPrice: 10, jackpot: 10000, players: 12, nextGameIn: 300 },
};

export const handleGetBingoRooms: RequestHandler = (req, res) => {
  try {
    const rooms = Object.values(bingoRooms);
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get rooms' });
  }
};

function generateBingoCard() {
  const card: number[][] = [[], [], [], [], []];
  const ranges = [
    [1, 15], [16, 30], [31, 45], [46, 60], [61, 75]
  ];

  for (let i = 0; i < 5; i++) {
    const [min, max] = ranges[i];
    const nums = new Set<number>();
    while (nums.size < 5) {
      nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    card[i] = Array.from(nums).sort((a, b) => a - b);
  }
  
  // Free space in middle
  card[2][2] = 0; 
  return card;
}

export const handleBuyBingoTicket: RequestHandler = async (req, res) => {
  try {
    const { roomId, count } = req.body;
    const room = bingoRooms[roomId];

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (!count || count < 1 || count > 100) {
      return res.status(400).json({ success: false, error: "Invalid ticket count (1-100)" });
    }

    const totalCost = room.ticketPrice * count;

    // Check wallet (use SC for bingo tickets)
    const wallet = WalletService.getWallet(DEFAULT_USER);
    if (wallet.sweepsCoins < totalCost) {
      return res.status(400).json({ success: false, error: "Insufficient Sweeps Coins" });
    }

    // Deduct cost
    const result = await WalletService.updateBalance(DEFAULT_USER, 'SC', -totalCost, 'bet');
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    // Generate cards
    const tickets = Array.from({ length: count }).map(() => ({
      card: generateBingoCard(),
      id: Math.random().toString(36).substring(7),
      markedNumbers: [] as number[]
    }));

    // Increment player count
    room.players += count;

    res.json({ 
      success: true, 
      data: { 
        message: `Purchased ${count} tickets for ${room.name}`,
        tickets,
        roomInfo: room,
        totalSpent: totalCost,
        wallet: result.wallet
      } 
    });
  } catch (error) {
    console.error('Buy ticket error:', error);
    res.status(500).json({ success: false, error: 'Failed to purchase tickets' });
  }
};

export const handleMarkNumber: RequestHandler = async (req, res) => {
  try {
    const { ticketId, number } = req.body;

    if (!number || number < 1 || number > 75) {
      return res.status(400).json({ success: false, error: "Invalid number" });
    }

    res.json({
      success: true,
      data: {
        message: "Number marked",
        number,
        ticketId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark number' });
  }
};

export const handleBingoWin: RequestHandler = async (req, res) => {
  try {
    const { roomId, winAmount } = req.body;
    const room = bingoRooms[roomId];

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (!winAmount || winAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid win amount" });
    }

    // Add winnings to player
    const result = await WalletService.updateBalance(DEFAULT_USER, 'SC', winAmount, 'win');

    res.json({
      success: true,
      data: {
        message: "Congratulations! You won!",
        winAmount,
        wallet: result.wallet,
        room
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process win' });
  }
};

export const handleGetConfig: RequestHandler = (req, res) => {
  res.json({ success: true, data: gameConfig });
};

export const handleUpdateConfig: RequestHandler = (req, res) => {
  const { rtp, minTicketPrice, maxTicketPrice, houseCommission } = req.body;

  if (rtp !== undefined && rtp > 0 && rtp <= 100) {
    gameConfig.rtp = rtp;
  }
  if (minTicketPrice !== undefined && minTicketPrice > 0) {
    gameConfig.minTicketPrice = minTicketPrice;
  }
  if (maxTicketPrice !== undefined && maxTicketPrice > gameConfig.minTicketPrice) {
    gameConfig.maxTicketPrice = maxTicketPrice;
  }
  if (houseCommission !== undefined && houseCommission >= 0 && houseCommission <= 50) {
    gameConfig.houseCommission = houseCommission;
  }

  res.json({ success: true, data: gameConfig });
};
