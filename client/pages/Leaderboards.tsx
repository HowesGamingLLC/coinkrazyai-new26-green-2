import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { leaderboards } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal } from 'lucide-react';
import { toast } from 'sonner';
import { LeaderboardEntry } from '@shared/api';

const Leaderboards = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchLeaderboards = async () => {
      try {
        const [leaderboardRes, myRankRes] = await Promise.all([
          leaderboards.getLeaderboard(),
          leaderboards.getMyRank(),
        ]);
        setLeaderboard(leaderboardRes.data?.entries || []);
        setMyRank(myRankRes.data || null);
      } catch (error: any) {
        console.error('Failed to fetch leaderboards:', error);
        toast.error('Failed to load leaderboards');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLeaderboards();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">LEADERBOARDS</h1>
        <p className="text-muted-foreground">Top players ranked by score</p>
      </div>

      {/* My Rank */}
      {myRank && (
        <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Your Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-4xl font-black text-primary"># {myRank.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-4xl font-black">{Number(myRank.score ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Global Leaderboard</CardTitle>
          <CardDescription>Top 50 players by total score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map(entry => (
              <div
                key={entry.player_id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  entry.player_id === user?.id
                    ? 'bg-primary/10 border-primary/30'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                {/* Rank & Name */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 flex items-center justify-center">
                    {getMedalIcon(entry.rank) ? (
                      <span className="text-2xl">{getMedalIcon(entry.rank)}</span>
                    ) : (
                      <Badge variant="outline" className="font-bold">
                        #{entry.rank}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="font-bold">
                      {entry.name}
                      {entry.player_id === user?.id && (
                        <Badge className="ml-2 text-xs">YOU</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">@{entry.username}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="font-bold text-lg">{Number(entry.score ?? 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How Scoring Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Players earn points based on their wins and total wagered amount across all games.</p>
          <p>The leaderboard updates in real-time as players win or lose.</p>
          <p>Top players receive exclusive rewards and recognition.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboards;
