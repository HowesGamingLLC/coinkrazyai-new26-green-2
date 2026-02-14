import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState('winnings');

  const leaderboards = {
    winnings: [
      { rank: 1, player: 'WhalePlayer', wins: '$125,450', badge: 'Platinum' },
      { rank: 2, player: 'LuckyStreak', wins: '$98,230', badge: 'Gold' },
      { rank: 3, player: 'HighRoller', wins: '$87,600', badge: 'Gold' },
      { rank: 4, player: 'PokerMaster', wins: '$76,540', badge: 'Silver' },
      { rank: 5, player: 'SlotsKing', wins: '$65,300', badge: 'Silver' },
      { rank: 6, player: 'YourName', wins: '$45,230', badge: 'Bronze' },
      { rank: 7, player: 'GameGuru', wins: '$42,100', badge: 'Bronze' },
      { rank: 8, player: 'LuckyDice', wins: '$38,500', badge: 'Member' }
    ],
    streak: [
      { rank: 1, player: 'FireStreak', streak: '45 Wins', badge: 'Gold' },
      { rank: 2, player: 'Lucky7', streak: '38 Wins', badge: 'Silver' },
      { rank: 3, player: 'Unstoppable', streak: '32 Wins', badge: 'Silver' },
      { rank: 4, player: 'HotHand', streak: '28 Wins', badge: 'Bronze' },
      { rank: 5, player: 'YouReAllWinning', streak: '24 Wins', badge: 'Member' }
    ],
    daily: [
      { rank: 1, player: 'TodayWinner', wins: '$5,450', badge: 'Gold' },
      { rank: 2, player: 'DailyGrind', wins: '$4,230', badge: 'Silver' },
      { rank: 3, player: 'YourName', wins: '$3,600', badge: 'Bronze' },
      { rank: 4, player: 'Player4', wins: '$2,540', badge: 'Member' },
      { rank: 5, player: 'Player5', wins: '$1,300', badge: 'Member' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3"><Trophy className="w-10 h-10 text-yellow-500" />Leaderboards</h1>
          <p className="text-muted-foreground mt-2">Compete with players worldwide</p>
        </div>

        {/* Leaderboard Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'winnings', label: 'All-Time Winnings' },
            { id: 'streak', label: 'Win Streaks' },
            { id: 'daily', label: 'Daily Winners' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {leaderboards[activeTab as keyof typeof leaderboards].map((entry, index) => {
                const isYou = entry.player === 'YourName';
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      isYou ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {entry.rank === 1 ? (
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      ) : entry.rank === 2 ? (
                        <Trophy className="w-6 h-6 text-gray-400" />
                      ) : entry.rank === 3 ? (
                        <Trophy className="w-6 h-6 text-orange-400" />
                      ) : (
                        <span className="font-black text-lg">{entry.rank}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${isYou ? 'text-primary' : ''}`}>
                        {entry.player}
                        {isYou && ' (You)'}
                      </p>
                      <Badge className="text-xs border-none mt-1 bg-muted/50">
                        {entry.badge}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-green-500">
                        {activeTab === 'winnings' ? entry.wins : entry.wins}
                      </p>
                      {activeTab === 'winnings' && (
                        <TrendingUp className="w-4 h-4 text-green-500 inline ml-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Your Rank Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground uppercase text-sm font-bold mb-1">Your Current Rank</p>
                <p className="text-3xl font-black">#6 / 50,000+</p>
                <p className="text-sm text-muted-foreground mt-1">Top 0.012% of players</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground uppercase text-sm font-bold mb-1">Total Winnings</p>
                <p className="text-3xl font-black text-green-500">$45,230</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
