import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Trophy, TrendingUp, Edit2, Copy } from 'lucide-react';

export default function Profile() {
  const [user] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    username: 'john_player_123',
    joinDate: 'January 15, 2024',
    level: 'Gold VIP',
    status: 'Active',
    totalPlayed: '$125,450',
    totalWins: '$45,230',
    favoriteGame: 'Mega Spin Slots',
    achievements: 12,
    friends: 24,
    wins: 342,
    losses: 658
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-black">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <Badge className="mt-2 bg-primary/10 text-primary border-none">{user.level}</Badge>
                </div>
              </div>
              <Button className="font-bold gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Wins</p>
                <p className="text-2xl font-black text-green-500">{user.wins}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Losses</p>
                <p className="text-2xl font-black text-red-500">{user.losses}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Win Rate</p>
                <p className="text-2xl font-black">{Math.round((user.wins / (user.wins + user.losses)) * 100)}%</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Total Played</p>
                <p className="text-2xl font-black">{user.totalPlayed}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase font-bold">Total Wins</p>
                <p className="text-2xl font-black text-green-500">{user.totalWins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Email</p>
                  <p className="font-bold">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Joined</p>
                  <p className="font-bold">{user.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Achievements</p>
                  <p className="font-bold">{user.achievements} Unlocked</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Favorite Game</p>
                  <p className="font-bold">{user.favoriteGame}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { game: 'Mega Spin Slots', result: 'Win', amount: '+$250', time: '2 hours ago' },
                { game: 'Diamond Poker', result: 'Loss', amount: '-$50', time: '5 hours ago' },
                { game: 'Bingo Bonanza', result: 'Win', amount: '+$125', time: '1 day ago' },
                { game: 'Sports Betting', result: 'Win', amount: '+$500', time: '2 days ago' }
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-bold">{activity.game}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={activity.result === 'Win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} style={{borderStyle: 'none'}}>
                      {activity.result}
                    </Badge>
                    <p className={`font-black mt-1 ${activity.result === 'Win' ? 'text-green-500' : 'text-red-500'}`}>
                      {activity.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
