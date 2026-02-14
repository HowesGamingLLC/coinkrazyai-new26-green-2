import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Users } from 'lucide-react';

export const JackpotManagement = () => {
  const [jackpots] = useState([
    { name: 'Daily Jackpot', amount: '$45,230', contributors: 1204, contribution: '0.5%', status: 'Active' },
    { name: 'Weekly Mega', amount: '$128,500', contributors: 3421, contribution: '1.0%', status: 'Active' },
    { name: 'Monthly Grand', amount: '$512,750', contributors: 8942, contribution: '2.0%', status: 'Active' },
    { name: 'Seasonal Special', amount: '$1.2M', contributors: 12000, contribution: '3.0%', status: 'Scheduled' }
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Total in Pools</p>
            <p className="text-3xl font-black">$1.88M</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Contributors</p>
            <p className="text-3xl font-black">25K+</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground uppercase font-bold">Winners/Month</p>
            <p className="text-3xl font-black">128</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Jackpot Pools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {jackpots.map((jackpot) => (
            <div key={jackpot.name} className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h4 className="font-bold">{jackpot.name}</h4>
                    <p className="text-sm text-muted-foreground">{jackpot.contributors} contributors</p>
                  </div>
                </div>
                <Badge className={jackpot.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'} style={{borderStyle: 'none'}}>
                  {jackpot.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Amount</p>
                  <p className="text-lg font-black">{jackpot.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Contribution</p>
                  <p className="text-lg font-black">{jackpot.contribution}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Contributors</p>
                  <p className="text-lg font-black">{jackpot.contributors.toLocaleString()}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-8">Configure</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Winners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { player: 'LuckyPlayer_2024', pool: 'Weekly Mega', won: '$45,320', time: '2 hours ago' },
              { player: 'JackpotMaster', pool: 'Daily Jackpot', won: '$12,450', time: '5 hours ago' },
              { player: 'MegaWinner', pool: 'Monthly Grand', won: '$128,500', time: '1 day ago' }
            ].map((winner) => (
              <div key={winner.player} className="p-3 bg-muted/30 rounded border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold">{winner.player}</p>
                  <p className="text-xs text-muted-foreground">{winner.pool} • {winner.time}</p>
                </div>
                <p className="font-black text-green-500">{winner.won}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
