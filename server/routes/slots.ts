import { RequestHandler } from "express";

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

export const handleSpin: RequestHandler = (req, res) => {
  const { bet, currency } = req.body;

  if (!bet || bet <= 0) {
    return res.status(400).json({ success: false, error: "Invalid bet" });
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

  // Calculate winnings (simplified: only horizontal lines)
  let winnings = 0;
  const paylines = [
    [reels[0][0], reels[1][0], reels[2][0]],
    [reels[0][1], reels[1][1], reels[2][1]],
    [reels[0][2], reels[1][2], reels[2][2]],
  ];

  paylines.forEach(line => {
    if (line[0] === line[1] && line[1] === line[2]) {
      const symbol = SYMBOLS.find(s => s.id === line[0]);
      if (symbol) winnings += symbol.value * bet;
    }
  });

  res.json({
    success: true,
    data: {
      reels,
      winnings,
      newBalance: 1000 // In production, update wallet atomically
    }
  });
};
