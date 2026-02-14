import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Lock } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [playerAchievements, setPlayerAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAchievement, setRecentAchievement] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, playerRes] = await Promise.all([
          ApiClient.getAchievements(),
          ApiClient.getPlayerAchievements()
        ]);

        if (allRes.success && allRes.data) {
          setAchievements(allRes.data);
        }

        if (playerRes.success && playerRes.data) {
          setPlayerAchievements(playerRes.data);
          // Get the most recent achievement
          if (playerRes.data.length > 0) {
            setRecentAchievement(playerRes.data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        toast({ title: 'Error', description: 'Failed to load achievements', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const enrichedAchievements = achievements.map(achievement => {
    const playerAch = playerAchievements.find(pa => pa.id === achievement.id);
    return {
      ...achievement,
      unlocked: !!playerAch,
      unlockedAt: playerAch?.unlocked_at,
      progress: playerAch?.progress || 0
    };
  });

  const unlockedCount = enrichedAchievements.filter(a => a.unlocked).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

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
                <p className="text-3xl font-black">{enrichedAchievements.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase text-sm font-bold">Progress</p>
                <p className="text-3xl font-black">{enrichedAchievements.length > 0 ? Math.round((unlockedCount / enrichedAchievements.length) * 100) : 0}%</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase text-sm font-bold">Total Points</p>
                <p className="text-3xl font-black">{playerAchievements.reduce((sum, a) => sum + (a.points || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedAchievements.map((achievement) => (
            <Card key={achievement.id} className={achievement.unlocked ? 'border-primary/20' : 'border-border/30 opacity-60'}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{achievement.icon || '🏆'}</div>
                  {achievement.unlocked ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>

                {!achievement.unlocked && (
                  <>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{width: `${Math.min(achievement.progress, 100)}%`}}
                      ></div>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">{Math.round(achievement.progress)}%</p>
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
        {recentAchievement && (
          <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5">
            <CardHeader>
              <CardTitle>Recent Achievement: {recentAchievement.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{recentAchievement.description} You've earned {recentAchievement.points || 0} achievement points.</p>
              <div className="flex gap-2">
                <Badge className="bg-yellow-500/10 text-yellow-500 border-none">{recentAchievement.icon || '🏆'} {recentAchievement.name}</Badge>
                <Badge className="bg-primary/10 text-primary border-none">+{recentAchievement.points || 0} Points</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
