import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState('all_time');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [playerRank, setPlayerRank] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Map tab names to valid leaderboard types
        const typeMap: { [key: string]: string } = {
          'all_time': 'wins',
          'monthly': 'wins',
          'daily': 'wins'
        };
        const type = typeMap[activeTab] || 'wins';

        const res = await ApiClient.getLeaderboard(type, activeTab);
        if (res.success && res.data) {
          setLeaderboardData(res.data.entries || res.data);
        } else {
          toast({ title: 'Error', description: 'Failed to load leaderboard', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        toast({ title: 'Error', description: 'Failed to load leaderboard', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  useEffect(() => {
    const fetchPlayerRank = async () => {
      try {
        // Only fetch player rank if user has an auth token
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          return;
        }

        const res = await ApiClient.getPlayerRank();
        if (res.success && res.data) {
          setPlayerRank(res.data);
        }
      } catch (error) {
        // Session might be expired, which is okay - leaderboard can still be viewed
        console.debug('Could not fetch player rank (user may not be authenticated):', error);
      }
    };

    fetchPlayerRank();
  }, []);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-400" />;
    return <span className="font-black text-lg">{rank}</span>;
  };

  const formatValue = (value: any, type: string) => {
    if (type === 'winnings') return `$${value.toLocaleString()}`;
    if (type === 'wins') return `${value} Wins`;
    if (type === 'streak') return `${value} Win Streak`;
    return value;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded w-32" />)}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

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
            { id: 'all_time', label: 'All-Time' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'daily', label: 'Daily' }
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
              {leaderboardData.slice(0, 10).map((entry, index) => {
                const isYourRank = playerRank && playerRank.rank === entry.rank;
                const displayValue = entry.total_wins !== undefined ? entry.total_wins : entry.amount || 0;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      isYourRank ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {getRankMedal(entry.rank)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${isYourRank ? 'text-primary' : ''}`}>
                        {entry.username}
                        {isYourRank && ' (You)'}
                      </p>
                      <Badge className="text-xs border-none mt-1 bg-muted/50">
                        {entry.badge || 'Member'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-green-500">
                        ${displayValue.toLocaleString()}
                      </p>
                      <TrendingUp className="w-4 h-4 text-green-500 inline ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Your Rank Card */}
        {playerRank && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground uppercase text-sm font-bold mb-1">Your Current Rank</p>
                  <p className="text-3xl font-black">#{playerRank.rank}</p>
                  <p className="text-sm text-muted-foreground mt-1">Top {Math.round((playerRank.rank / (playerRank.total_players || 50000)) * 100 * 10) / 10}% of players</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground uppercase text-sm font-bold mb-1">Total Winnings</p>
                  <p className="text-3xl font-black text-green-500">${(playerRank.total_wins || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
