import { RequestHandler } from "express";
import { WalletService } from "../services/wallet-service";

const DEFAULT_USER = 'default-user';

interface GameMatch {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  spread: string;
  overUnder: number;
  time: string;
  odds: number;
}

// Game configuration
let gameConfig = {
  rtp: 92,
  minBet: 1,
  maxBet: 1000,
  minParlay: 3,
  maxParlay: 10,
  houseCommission: 8, // percentage
};

const LIVE_GAMES: GameMatch[] = [
  { id: 'game-1', sport: 'NFL', homeTeam: 'Chiefs', awayTeam: 'Eagles', spread: '-3.5', overUnder: 48.5, time: 'Q3 8:42', odds: 1.9 },
  { id: 'game-2', sport: 'NBA', homeTeam: 'Lakers', awayTeam: 'Celtics', spread: '+2.5', overUnder: 224.5, time: 'Q1 2:15', odds: 1.85 },
  { id: 'game-3', sport: 'MLB', homeTeam: 'Dodgers', awayTeam: 'Yankees', spread: '-1.5', overUnder: 8.5, time: 'Bottom 4', odds: 1.95 },
  { id: 'game-4', sport: 'NHL', homeTeam: 'Bruins', awayTeam: 'Leafs', spread: '-0.5', overUnder: 5.5, time: 'P2 15:20', odds: 1.88 },
  { id: 'game-5', sport: 'NBA', homeTeam: 'Warriors', awayTeam: 'Nuggets', spread: '+1.5', overUnder: 228.0, time: 'Q2 6:30', odds: 1.92 },
  { id: 'game-6', sport: 'NFL', homeTeam: 'Patriots', awayTeam: 'Bills', spread: '-2.0', overUnder: 42.5, time: 'Q4 1:15', odds: 1.87 },
];

export const handleGetLiveGames: RequestHandler = (req, res) => {
  try {
    res.json({ success: true, data: LIVE_GAMES });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get games' });
  }
};

export const handlePlaceParlay: RequestHandler = async (req, res) => {
  try {
    const { picks, bet, currency = 'SC' } = req.body;

    if (!picks || !Array.isArray(picks) || picks.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid picks" });
    }

    if (picks.length < gameConfig.minParlay || picks.length > gameConfig.maxParlay) {
      return res.status(400).json({ 
        success: false, 
        error: `Parlay must have between ${gameConfig.minParlay} and ${gameConfig.maxParlay} picks` 
      });
    }

    if (!bet || bet <= 0 || bet < gameConfig.minBet || bet > gameConfig.maxBet) {
      return res.status(400).json({ 
        success: false, 
        error: `Bet must be between ${gameConfig.minBet} and ${gameConfig.maxBet}` 
      });
    }

    // Validate all picks exist
    const pickIds = picks.map((p: any) => p.gameId);
    const allGamesExist = pickIds.every((id: string) => LIVE_GAMES.find(g => g.id === id));
    
    if (!allGamesExist) {
      return res.status(400).json({ success: false, error: "One or more games not found" });
    }

    // Check wallet
    const wallet = WalletService.getWallet(DEFAULT_USER);
    const currencyKey = currency === 'GC' ? 'goldCoins' : 'sweepsCoins';
    
    if (wallet[currencyKey] < bet) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient ${currency === 'GC' ? 'Gold Coins' : 'Sweeps Coins'}` 
      });
    }

    // Deduct bet
    const betResult = await WalletService.updateBalance(DEFAULT_USER, currency as 'GC' | 'SC', -bet, 'bet');
    if (!betResult.success) {
      return res.status(400).json({ success: false, error: betResult.error });
    }

    // Calculate potential payout (simplified)
    // In a real system, this would use actual odds
    let odds = 1;
    picks.forEach((pick: any) => {
      const game = LIVE_GAMES.find(g => g.id === pick.gameId);
      if (game) {
        odds *= game.odds;
      }
    });

    const potentialPayout = bet * odds;

    res.json({ 
      success: true, 
      data: { 
        message: "Parlay bet placed successfully!",
        parlay: {
          id: Math.random().toString(36).substring(7),
          picks,
          bet,
          currency,
          odds,
          potentialPayout,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        wallet: betResult.wallet
      } 
    });
  } catch (error) {
    console.error('Place parlay error:', error);
    res.status(500).json({ success: false, error: 'Failed to place parlay' });
  }
};

export const handleSingleBet: RequestHandler = async (req, res) => {
  try {
    const { gameId, betType, bet, currency = 'SC' } = req.body;

    if (!gameId || !betType || !bet || bet <= 0) {
      return res.status(400).json({ success: false, error: "Invalid bet parameters" });
    }

    const game = LIVE_GAMES.find(g => g.id === gameId);
    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }

    // Check wallet
    const wallet = WalletService.getWallet(DEFAULT_USER);
    const currencyKey = currency === 'GC' ? 'goldCoins' : 'sweepsCoins';
    
    if (wallet[currencyKey] < bet) {
      return res.status(400).json({ success: false, error: "Insufficient balance" });
    }

    // Deduct bet
    const betResult = await WalletService.updateBalance(DEFAULT_USER, currency as 'GC' | 'SC', -bet, 'bet');
    
    const potentialPayout = bet * game.odds;

    res.json({
      success: true,
      data: {
        message: "Bet placed successfully!",
        bet: {
          id: Math.random().toString(36).substring(7),
          gameId,
          betType,
          amount: bet,
          currency,
          odds: game.odds,
          potentialPayout,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        wallet: betResult.wallet
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to place bet' });
  }
};

export const handleGetConfig: RequestHandler = (req, res) => {
  res.json({ success: true, data: gameConfig });
};

export const handleUpdateConfig: RequestHandler = (req, res) => {
  const { rtp, minBet, maxBet, minParlay, maxParlay, houseCommission } = req.body;

  if (rtp !== undefined && rtp > 0 && rtp <= 100) {
    gameConfig.rtp = rtp;
  }
  if (minBet !== undefined && minBet > 0) {
    gameConfig.minBet = minBet;
  }
  if (maxBet !== undefined && maxBet > gameConfig.minBet) {
    gameConfig.maxBet = maxBet;
  }
  if (minParlay !== undefined && minParlay > 0) {
    gameConfig.minParlay = minParlay;
  }
  if (maxParlay !== undefined && maxParlay > gameConfig.minParlay) {
    gameConfig.maxParlay = maxParlay;
  }
  if (houseCommission !== undefined && houseCommission >= 0 && houseCommission <= 50) {
    gameConfig.houseCommission = houseCommission;
  }

  res.json({ success: true, data: gameConfig });
};
