import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Users, Star, Medal, TrendingUp, Flame, Crown, Zap } from 'lucide-react';
import { apiCall } from '@/lib/api';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  username: string;
  referral_count: number;
  total_earned_sc: number;
  avatar_url?: string;
}

export const ReferralLeaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall<LeaderboardEntry[]>('/referral/leaderboard');
      if (response) {
        setEntries(response);
      }
    } catch (error) {
      console.error('Failed to fetch referral leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-yellow-200/50 shadow-2xl">
        <CardContent className="py-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-600" />
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-200/40 dark:border-yellow-900/60 shadow-2xl overflow-hidden bg-gradient-to-br from-yellow-50/50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900/50 dark:to-yellow-950/10 relative">
      <CardHeader className="bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-600/5 border-b border-yellow-200/30 dark:border-yellow-900/30 relative overflow-hidden pt-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 blur-3xl rounded-full -mr-20 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -ml-16 -mb-10" />

        <div className="flex items-center justify-between relative z-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/40 border-2 border-yellow-300/50">
                <Trophy className="w-8 h-8" />
              </div>
              <Flame className="absolute -top-2 -right-2 w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-yellow-600 to-amber-700 bg-clip-text text-transparent">
                Referral Legends
              </CardTitle>
              <CardDescription className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-widest mt-1">
                🏆 Global Top Influencers • Earn & Compete
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant="outline" className="border-yellow-300/50 bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-300 font-black italic text-xs uppercase px-3 py-1">
              <Zap className="w-3 h-3 mr-1" /> Live Ranking
            </Badge>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Top {entries.length} Earners</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-100/60 to-amber-100/40 dark:from-yellow-950/30 dark:to-amber-950/20 text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 border-b border-yellow-200/50 dark:border-yellow-900/30">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Influencer</th>
                <th className="p-4 text-center">Referrals</th>
                <th className="p-4 text-right pr-6">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100/30 dark:divide-yellow-900/20">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center">
                    <div className="space-y-3">
                      <Star className="w-12 h-12 mx-auto opacity-20 text-amber-600" />
                      <p className="text-slate-400 font-bold italic text-lg">No Legends Yet...</p>
                      <p className="text-xs text-slate-400/70 font-bold uppercase tracking-widest">Be the first to earn referral rewards!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => {
                  const isTop3 = index < 3;
                  const isMedalist = index === 0 || index === 1 || index === 2;
                  const medalColor = index === 0 ? 'from-yellow-400 to-yellow-600' : index === 1 ? 'from-gray-300 to-gray-500' : 'from-amber-600 to-amber-800';
                  const medalBg = index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700';

                  return (
                    <tr
                      key={entry.username}
                      className={cn(
                        "transition-all hover:shadow-inner",
                        isTop3 && "bg-gradient-to-r from-yellow-50/50 to-amber-50/30 dark:from-yellow-950/20 dark:to-amber-950/10 hover:from-yellow-100/50 hover:to-amber-100/40 dark:hover:from-yellow-950/30 dark:hover:to-amber-950/20",
                        !isTop3 && "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                      )}
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center justify-center">
                          {isMedalist ? (
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg font-black text-lg",
                              medalBg,
                              index === 0 && "ring-2 ring-yellow-400/50 animate-pulse"
                            )}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                          ) : (
                            <span className="text-sm font-black italic text-slate-500 dark:text-slate-400 w-10 text-center">#{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-xs overflow-hidden shadow-md",
                            isTop3 ? "border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-50" : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          )}>
                            {entry.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className={cn(
                              "text-sm font-black italic uppercase tracking-tight",
                              isTop3 ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-slate-100"
                            )}>
                              {entry.username}
                            </p>
                            {isTop3 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-[8px] font-black uppercase text-yellow-600 dark:text-yellow-400">Top Influencer</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black italic text-slate-900 dark:text-slate-100">{entry.referral_count}</span>
                          <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Activations</span>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex flex-col items-end">
                          <span className={cn(
                            "text-xl font-black italic tracking-tighter",
                            isTop3 ? "text-yellow-600 dark:text-yellow-400" : "text-primary"
                          )}>
                            {entry.total_earned_sc.toFixed(2)} SC
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-[8px] font-bold text-green-600 dark:text-green-400 uppercase">Earning</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Promo */}
        <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white blur-2xl -mr-10 -mt-10" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-black italic uppercase tracking-tight mb-2">🔥 Reach #1 to Earn Exclusive Bonus!</p>
            <p className="text-[11px] font-bold uppercase opacity-95 tracking-widest">Top influencer gets 50.00 SC every week 💎</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
