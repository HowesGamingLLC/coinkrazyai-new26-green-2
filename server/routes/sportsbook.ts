import { RequestHandler } from "express";

interface GameMatch {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  spread: string;
  overUnder: number;
  time: string;
}

const LIVE_GAMES: GameMatch[] = [
  { id: 'game-1', sport: 'NFL', homeTeam: 'Chiefs', awayTeam: 'Eagles', spread: '-3.5', overUnder: 48.5, time: 'Q3 8:42' },
  { id: 'game-2', sport: 'NBA', homeTeam: 'Lakers', awayTeam: 'Celtics', spread: '+2.5', overUnder: 224.5, time: 'Q1 2:15' },
  { id: 'game-3', sport: 'MLB', homeTeam: 'Dodgers', awayTeam: 'Yankees', spread: '-1.5', overUnder: 8.5, time: 'Bottom 4' },
  { id: 'game-4', sport: 'NHL', homeTeam: 'Bruins', awayTeam: 'Leafs', spread: '-0.5', overUnder: 5.5, time: 'P2 15:20' },
];

export const handleGetLiveGames: RequestHandler = (req, res) => {
  res.json({ success: true, data: LIVE_GAMES });
};

export const handlePlaceParlay: RequestHandler = (req, res) => {
  const { picks, bet } = req.body;

  if (!picks || picks.length < 3) {
    return res.status(400).json({ success: false, error: "Parlay must have at least 3 picks" });
  }

  res.json({ 
    success: true, 
    data: { 
      message: "Parlay bet placed successfully!",
      potentialPayout: bet * (picks.length * 2.5) // Simplified payout logic
    } 
  });
};
