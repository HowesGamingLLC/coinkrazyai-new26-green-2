import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Lock } from 'lucide-react';

export default function Achievements() {
  const [achievements] = useState([
    { id: 1, name: 'High Roller', desc: 'Win $1,000+ in a single game', icon: '💎', unlocked: true, progress: '100%' },
    { id: 2, name: 'Streak Master', desc: 'Win 10 games in a row', icon: '🔥', unlocked: true, progress: '100%' },
    { id: 3, name: 'Poker Pro', desc: 'Win 50 poker games', icon: '♠️', unlocked: true, progress: '100%' },
    { id: 4, name: 'Slots Master', desc: 'Win 100 slots games', icon: '🎰', unlocked: false, progress: '67%' },
    { id: 5, name: 'Millionaire', desc: 'Win $1,000,000 total', icon: '💰', unlocked: false, progress: '45%' },
    { id: 6, name: 'Collector', desc: 'Unlock 25 achievements', icon: '🏆', unlocked: false, progress: '48%' },
    { id: 7, name: 'Social Butterfly', desc: 'Add 50 friends', icon: '👥', unlocked: false, progress: '32%' },
    { id: 8, name: 'Tournament Champion', desc: 'Win a tournament', icon: '👑', unlocked: false, progress: '0%' },
    { id: 9, name: 'Bingo Master', desc: 'Win 30 bingo games', icon: '🎲', unlocked: true, progress: '100%' },
    { id: 10, name: 'Early Bird', desc: 'Log in 7 days straight', icon: '🌅', unlocked: false, progress: '71%' },
    { id: 11, name: 'Big Spender', desc: 'Deposit $10,000', icon: '💳', unlocked: false, progress: '28%' },
    { id: 12, name: 'Bonus Hinter', desc: 'Claim 50 bonuses', icon: '🎁', unlocked: true, progress: '100%' }
  ]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3"><Award className="w-10 h-10 text-yellow-500" />Achievements</h1>
          <p className="text-muted-foreground mt-2">Unlock badges and rewards by completing challenges</p>
        </div>

        {/* Progress Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-muted-foreground uppercase text-sm font-bold">Total Unlocked</p>
                <p className="text-3xl font-black text-primary">{unlockedCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase text-sm font-bold">Total Available</p>
                <p className="text-3xl font-black">{achievements.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase text-sm font-bold">Progress</p>
                <p className="text-3xl font-black">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase text-sm font-bold">Total Points</p>
                <p className="text-3xl font-black">2,500</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className={achievement.unlocked ? 'border-primary/20' : 'border-border/30 opacity-60'}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  {achievement.unlocked ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{achievement.desc}</p>
                
                {!achievement.unlocked && (
                  <>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{width: achievement.progress}}
                      ></div>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">{achievement.progress}</p>
                  </>
                )}
                
                {achievement.unlocked && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-none">Unlocked!</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Achievement */}
        <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5">
          <CardHeader>
            <CardTitle>Recent Achievement: Poker Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You've unlocked the Poker Pro achievement! You've won 50 poker games and earned 200 achievement points.</p>
            <div className="flex gap-2">
              <Badge className="bg-yellow-500/10 text-yellow-500 border-none">♠️ Poker Pro</Badge>
              <Badge className="bg-primary/10 text-primary border-none">+200 Points</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
