import { RequestHandler } from "express";

interface BingoRoom {
  id: string;
  name: string;
  ticketPrice: number;
  jackpot: number;
  players: number;
  nextGameIn: number; // seconds
}

const BINGO_ROOMS: BingoRoom[] = [
  { id: 'room-1', name: 'Neon Nights', ticketPrice: 1, jackpot: 500, players: 120, nextGameIn: 45 },
  { id: 'room-2', name: 'Golden Galaxy', ticketPrice: 5, jackpot: 2500, players: 45, nextGameIn: 120 },
  { id: 'room-3', name: 'AI Arena', ticketPrice: 0.5, jackpot: 100, players: 300, nextGameIn: 15 },
  { id: 'room-4', name: 'Krazy Jackpot', ticketPrice: 10, jackpot: 10000, players: 12, nextGameIn: 300 },
];

export const handleGetBingoRooms: RequestHandler = (req, res) => {
  res.json({ success: true, data: BINGO_ROOMS });
};

export const handleBuyBingoTicket: RequestHandler = (req, res) => {
  const { roomId, count } = req.body;
  const room = BINGO_ROOMS.find(r => r.id === roomId);

  if (!room) {
    return res.status(404).json({ success: false, error: "Room not found" });
  }

  res.json({ 
    success: true, 
    data: { 
      message: `Purchased ${count} tickets for ${room.name}`,
      tickets: Array.from({ length: count }).map(() => generateBingoCard())
    } 
  });
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
