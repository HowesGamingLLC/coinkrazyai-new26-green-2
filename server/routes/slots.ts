import { RequestHandler } from "express";
import { WalletService } from "../services/wallet-service";

const DEFAULT_USER = 'default-user';

interface SlotSymbol {
  id: string;
  name: string;
  value: number;
  weight: number;
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', name: '🍒', value: 2, weight: 100 },
  { id: 'lemon', name: '🍋', value: 3, weight: 80 },
  { id: 'orange', name: '🍊', value: 4, weight: 60 },
  { id: 'plum', name: '🍇', value: 5, weight: 40 },
  { id: 'bell', name: '🔔', value: 10, weight: 20 },
  { id: 'diamond', name: '💎', value: 50, weight: 10 },
  { id: 'seven', name: '7️⃣', value: 100, weight: 5 },
];

// Game configuration that can be updated by admin
let gameConfig = {
  rtp: 95, // Return to Player percentage
  minBet: 0.01,
  maxBet: 100,
};

export const handleSpin: RequestHandler = async (req, res) => {
  try {
    const { bet, currency } = req.body;

    if (!bet || bet <= 0) {
      return res.status(400).json({ success: false, error: "Invalid bet amount" });
    }

    if (bet < gameConfig.minBet || bet > gameConfig.maxBet) {
      return res.status(400).json({ 
        success: false, 
        error: `Bet must be between ${gameConfig.minBet} and ${gameConfig.maxBet}` 
      });
    }

    // Get current wallet
    const wallet = WalletService.getWallet(DEFAULT_USER);
    const balanceKey = currency === 'GC' ? 'goldCoins' : 'sweepsCoins';
    
    if (wallet[balanceKey] < bet) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient ${currency === 'GC' ? 'Gold Coins' : 'Sweeps Coins'}` 
      });
    }

    // Deduct bet from wallet
    const deductResult = await WalletService.updateBalance(DEFAULT_USER, currency as 'GC' | 'SC', -bet, 'bet');
    if (!deductResult.success) {
      return res.status(400).json({ success: false, error: deductResult.error });
    }

    // Generate 3x3 grid
    const reels: string[][] = [[], [], []];
    const totalWeight = SYMBOLS.reduce((acc, s) => acc + s.weight, 0);

    const getRandomSymbol = () => {
      let random = Math.random() * totalWeight;
      for (const symbol of SYMBOLS) {
        if (random < symbol.weight) return symbol;
        random -= symbol.weight;
      }
      return SYMBOLS[0];
    };

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        reels[i][j] = getRandomSymbol().id;
      }
    }

    // Calculate winnings (check horizontal, vertical, and diagonal lines)
    let winnings = 0;
    const winLines: string[][] = [];

    // Horizontal lines
    for (let row = 0; row < 3; row++) {
      const line = [reels[row][0], reels[row][1], reels[row][2]];
      if (line[0] === line[1] && line[1] === line[2]) {
        const symbol = SYMBOLS.find(s => s.id === line[0]);
        if (symbol) {
          const lineWinnings = symbol.value * bet;
          winnings += lineWinnings;
          winLines.push(line);
        }
      }
    }

    // Vertical lines
    for (let col = 0; col < 3; col++) {
      const line = [reels[0][col], reels[1][col], reels[2][col]];
      if (line[0] === line[1] && line[1] === line[2]) {
        const symbol = SYMBOLS.find(s => s.id === line[0]);
        if (symbol) {
          const lineWinnings = symbol.value * bet;
          winnings += lineWinnings;
          winLines.push(line);
        }
      }
    }

    // Diagonal lines
    const diag1 = [reels[0][0], reels[1][1], reels[2][2]];
    if (diag1[0] === diag1[1] && diag1[1] === diag1[2]) {
      const symbol = SYMBOLS.find(s => s.id === diag1[0]);
      if (symbol) {
        const lineWinnings = symbol.value * bet;
        winnings += lineWinnings;
        winLines.push(diag1);
      }
    }

    const diag2 = [reels[0][2], reels[1][1], reels[2][0]];
    if (diag2[0] === diag2[1] && diag2[1] === diag2[2]) {
      const symbol = SYMBOLS.find(s => s.id === diag2[0]);
      if (symbol) {
        const lineWinnings = symbol.value * bet;
        winnings += lineWinnings;
        winLines.push(diag2);
      }
    }

    // Add winnings to wallet if any
    let finalWallet = deductResult.wallet;
    if (winnings > 0) {
      const winResult = await WalletService.updateBalance(DEFAULT_USER, currency as 'GC' | 'SC', winnings, 'win');
      if (winResult.success) {
        finalWallet = winResult.wallet;
      }
    }

    res.json({
      success: true,
      data: {
        reels,
        winnings,
        newBalance: finalWallet[balanceKey],
        wallet: finalWallet,
        won: winnings > 0,
        winLines: winLines.length > 0 ? winLines : []
      }
    });
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ success: false, error: 'Failed to process spin' });
  }
};

export const handleGetConfig: RequestHandler = (req, res) => {
  res.json({ success: true, data: gameConfig });
};

export const handleUpdateConfig: RequestHandler = (req, res) => {
  const { rtp, minBet, maxBet } = req.body;
  
  if (rtp !== undefined && rtp > 0 && rtp <= 100) {
    gameConfig.rtp = rtp;
  }
  if (minBet !== undefined && minBet > 0) {
    gameConfig.minBet = minBet;
  }
  if (maxBet !== undefined && maxBet > gameConfig.minBet) {
    gameConfig.maxBet = maxBet;
  }

  res.json({ success: true, data: gameConfig });
};
