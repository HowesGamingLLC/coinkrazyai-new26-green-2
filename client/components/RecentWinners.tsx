import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Coins, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Winner {
  id: number;
  username: string;
  amount: string;
  game: string;
  time: string;
  avatar: string;
}

const RECENT_WINNERS: Winner[] = [
  { id: 1, username: 'SlotMaster99', amount: '1,250.00 SC', game: 'Knights vs Barbarians', time: '2m ago', avatar: '1' },
  { id: 2, username: 'LuckyLady', amount: '5,000.00 GC', game: 'Emerald King', time: '5m ago', avatar: '2' },
  { id: 3, username: 'CoinKing', amount: '850.50 SC', game: 'Arcanum', time: '8m ago', avatar: '3' },
  { id: 4, username: 'DiceRoller', amount: '12,500.00 GC', game: 'Power Plinko', time: '12m ago', avatar: '4' },
];

export const RecentWinners = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-black italic uppercase tracking-tight">Recent Big Winners</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {RECENT_WINNERS.map((winner) => (
          <Card key={winner.id} className="bg-slate-900/50 border-white/5 overflow-hidden group hover:border-yellow-500/30 transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-yellow-500/30 overflow-hidden bg-slate-800 flex-shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${winner.avatar}`} alt={winner.username} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-black italic text-sm truncate text-white">{winner.username}</p>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{winner.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Coins className="w-3 h-3 text-yellow-500" />
                  <p className="text-yellow-500 font-black text-sm">{winner.amount}</p>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase truncate mt-0.5">{winner.game}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
