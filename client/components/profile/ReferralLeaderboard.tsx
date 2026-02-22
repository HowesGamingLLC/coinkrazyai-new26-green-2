import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Users, Star, Medal, TrendingUp } from 'lucide-react';
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
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-100 dark:border-yellow-900 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-950 dark:to-yellow-950/10">
      <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Referral Legends</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Global Top Influencers</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-yellow-200 text-amber-600 font-black italic bg-white/50 dark:bg-slate-900/50">
            WEEKLY RESET
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-yellow-50/50 dark:bg-yellow-950/20 text-[10px] font-black uppercase text-amber-700/70 border-b border-yellow-100 dark:border-yellow-900/50">
                <th className="p-4 pl-8">Rank</th>
                <th className="p-4">Influencer</th>
                <th className="p-4 text-center">Referrals</th>
                <th className="p-4 text-right pr-8">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100/50 dark:divide-yellow-900/30">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 font-bold italic">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Waiting for the first legend to emerge...
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => {
                  const isTop3 = index < 3;
                  return (
                    <tr 
                      key={entry.username} 
                      className={cn(
                        "transition-colors",
                        isTop3 ? "bg-yellow-400/5 hover:bg-yellow-400/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      <td className="p-4 pl-8">
                        {index === 0 ? (
                          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-white shadow-lg shadow-yellow-400/30">
                            <Medal className="w-5 h-5" />
                          </div>
                        ) : index === 1 ? (
                          <div className="w-8 h-8 rounded-lg bg-slate-300 flex items-center justify-center text-slate-700 shadow-lg shadow-slate-300/30">
                            <Medal className="w-5 h-5" />
                          </div>
                        ) : index === 2 ? (
                          <div className="w-8 h-8 rounded-lg bg-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-700/30">
                            <Medal className="w-5 h-5" />
                          </div>
                        ) : (
                          <span className="text-sm font-black italic text-slate-400 ml-2">#{index + 1}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs overflow-hidden",
                            isTop3 ? "border-yellow-400 bg-white" : "border-slate-200 bg-slate-100"
                          )}>
                            {entry.avatar_url ? (
                              <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                            ) : (
                              entry.username.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className={cn(
                              "text-sm font-black italic uppercase tracking-tight",
                              isTop3 ? "text-amber-600" : "text-slate-900 dark:text-slate-100"
                            )}>
                              {entry.username}
                            </p>
                            {isTop3 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-[9px] font-black uppercase text-yellow-600">Elite Partner</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black italic text-slate-900 dark:text-slate-100">{entry.referral_count}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Activations</span>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-8">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black italic text-primary tracking-tighter">
                            {entry.total_earned_sc.toFixed(2)} SC
                          </span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-[9px] font-bold text-green-600 uppercase">Top 1% earner</span>
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
        <div className="p-6 bg-amber-500 text-white text-center">
          <p className="text-sm font-black italic uppercase tracking-tight mb-1">🔥 Top Weekly Influencer Bonus</p>
          <p className="text-[10px] font-bold uppercase opacity-90 tracking-widest">Reach #1 to unlock an exclusive 50.00 SC Weekend Bonus!</p>
        </div>
      </CardContent>
    </Card>
  );
};
