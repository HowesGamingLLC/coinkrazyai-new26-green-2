import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Copy, Share2, Gift, TrendingUp, Loader2, Link as LinkIcon, Trophy, Zap, ArrowUpRight, Mail, MessageCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { referrals as referralsApi } from '@/lib/api';
import { ReferralLeaderboard } from '@/components/profile/ReferralLeaderboard';
import { cn } from '@/lib/utils';

const Referrals = () => {
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnedSC: 0,
    totalEarnedGC: 0,
    uniqueCode: ''
  });
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [shareMode, setShareMode] = useState<'link' | 'twitter' | 'facebook' | 'email' | null>(null);
  const [refetchInterval, setRefetchInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchReferralData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchReferralData, 30000);
    setRefetchInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const fetchReferralData = async () => {
    try {
      const [linkRes, statsRes, recentRes] = await Promise.all([
        referralsApi.getLink(),
        referralsApi.getStats(),
        referralsApi.getRecent(50)
      ]);

      if (linkRes.success || linkRes.data?.referralUrl) {
        setReferralLink(linkRes.data?.referralUrl || linkRes.data?.link || '');
      }
      if (statsRes.success || statsRes.data) {
        const data = statsRes.data || statsRes;
        setStats({
          totalReferrals: data.totalReferrals || 0,
          activeReferrals: data.completedReferrals || 0,
          totalEarnedSC: data.totalScEarned || 0,
          totalEarnedGC: data.totalGcEarned || 0,
          uniqueCode: data.uniqueCode || ''
        });
      }
      if (recentRes.success || recentRes.data) {
        setRecentReferrals((recentRes.data || recentRes) as any[]);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      if (isLoading) {
        toast.error('Failed to load referral information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setIsCopying(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
      setIsCopying(false);
    }
  };

  const shareOnTwitter = () => {
    const text = `Join me on CoinKrazy AI and start earning! 🎰 Use my referral link and get instant rewards. ${referralLink}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
    toast.success('Opening Twitter...');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent('Join me on CoinKrazy AI and earn rewards!')}`;
    window.open(url, '_blank', 'width=550,height=420');
    toast.success('Opening Facebook...');
  };

  const shareViaEmail = () => {
    const subject = 'Join me on CoinKrazy AI - Exclusive Rewards!';
    const body = `Hey! I'm inviting you to join CoinKrazy AI, an amazing gaming platform where you can earn real rewards. Use my referral link to get instant bonuses: ${referralLink}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold">Loading your referral dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Refer a Friend</h1>
          <p className="text-muted-foreground font-bold">Earn massive rewards for every player you bring to CoinKrazy AI!</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-4 flex items-center gap-4">
           <Gift className="w-8 h-8 text-primary animate-bounce" />
           <div>
              <p className="text-xs font-black uppercase text-primary/70">Current Reward</p>
              <p className="text-xl font-black italic">5.00 SC + 10,000 GC</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-black uppercase text-blue-600 flex items-center gap-2">
              <Users className="w-4 h-4" /> Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-5xl font-black italic text-blue-600">{stats.totalReferrals}</p>
            <p className="text-xs text-blue-500/70 font-bold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {stats.activeReferrals} Completed
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mr-10 -mt-10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-black uppercase text-green-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> SC Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-5xl font-black italic text-green-600">{stats.totalEarnedSC.toFixed(2)}</p>
            <p className="text-xs text-green-500/70 font-bold mt-2">Sweepstakes Coins</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/20 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-black uppercase text-amber-600 flex items-center gap-2">
              <Gift className="w-4 h-4" /> GC Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-3xl font-black italic text-amber-600">{(stats.totalEarnedGC / 1000).toFixed(1)}K</p>
            <p className="text-xs text-amber-500/70 font-bold mt-2">Gold Coins</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-10 -mt-10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-black uppercase text-purple-600 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Bonus per Ref
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-sm font-black italic text-purple-600">5.00 SC</p>
            <p className="text-xs text-purple-500/70 font-bold mt-2">+ 10,000 GC</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border-2 border-primary/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />

        <CardHeader className="relative z-10 text-center space-y-4 pt-10">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border-3 border-primary/50 shadow-lg shadow-primary/20">
            <LinkIcon className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Your Magic Referral Link
            </CardTitle>
            <CardDescription className="text-slate-300 font-bold uppercase text-xs tracking-widest">
              Share this link and earn rewards when friends join and verify!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6 pb-10">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex gap-2 items-stretch">
              <div className="flex-1 bg-slate-800/50 border-2 border-primary/20 rounded-2xl p-4 font-mono text-sm text-slate-200 break-all select-all overflow-x-auto hover:border-primary/40 transition-colors">
                {referralLink || 'Generating your link...'}
              </div>
              <Button
                onClick={copyToClipboard}
                size="lg"
                className="px-8 font-black italic uppercase bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
              >
                {isCopying ? (
                  <><CheckCircle2 className="w-5 h-5 mr-2" /> COPIED!</>
                ) : (
                  <><Copy className="w-5 h-5 mr-2" /> COPY</>
                )}
              </Button>
            </div>

            {stats.uniqueCode && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Your Referral Code</p>
                <p className="text-lg font-black text-primary italic mt-1">{stats.uniqueCode}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 font-bold italic uppercase text-xs h-auto py-3"
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              className="bg-blue-400/10 border-blue-400/30 hover:bg-blue-400/20 font-bold italic uppercase text-xs h-auto py-3"
            >
              <Share2 className="w-4 h-4 mr-2" /> Twitter
            </Button>
            <Button
              onClick={shareOnFacebook}
              variant="outline"
              className="bg-blue-600/10 border-blue-600/30 hover:bg-blue-600/20 font-bold italic uppercase text-xs h-auto py-3"
            >
              <Share2 className="w-4 h-4 mr-2" /> Facebook
            </Button>
            <Button
              onClick={shareViaEmail}
              variant="outline"
              className="bg-green-500/10 border-green-500/30 hover:bg-green-500/20 font-bold italic uppercase text-xs h-auto py-3"
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-black italic uppercase bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">How It Works</h2>
          <div className="space-y-3">
            {[
              { step: 1, icon: '📤', title: 'Send Invite', desc: 'Share your referral link with friends via social media, text, or email.' },
              { step: 2, icon: '📝', title: 'Friend Joins', desc: 'They register and complete KYC verification with your link.' },
              { step: 3, icon: '💰', title: 'Get Rewarded', desc: 'When they make their first purchase, you earn 5.00 SC + 10K GC!' }
            ].map((item) => (
              <div key={item.step} className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-4 bg-muted/40 rounded-xl border border-border/50 group-hover:border-primary/50 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-primary/30 transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black italic uppercase text-sm leading-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-200/30 mt-6">
            <CardContent className="pt-6">
              <div className="space-y-3 text-center">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto animate-pulse" />
                <div>
                  <p className="text-sm font-black italic uppercase text-yellow-600">Bonus Round</p>
                  <p className="text-xs text-yellow-600/70 font-bold mt-1">Refer 5 friends → Extra 25 SC!</p>
                  <p className="text-xs text-yellow-600/70 font-bold">Refer 10 friends → VIP Status!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <ReferralLeaderboard />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-black italic uppercase bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Your Recent Referrals
          </h2>
          {recentReferrals.length > 0 && (
            <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary font-black italic">
              {recentReferrals.length} Total
            </Badge>
          )}
        </div>

        <Card className="border-border/30 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {recentReferrals.length > 0 ? (
              <div className="divide-y divide-border/30">
                {recentReferrals.map((ref, idx) => {
                  const isCompleted = ref.status === 'completed';
                  const isPending = ref.status === 'pending';
                  return (
                    <div
                      key={ref.id}
                      className={cn(
                        "flex items-center justify-between p-4 transition-all hover:bg-muted/40",
                        isCompleted && "bg-green-500/5",
                        isPending && "bg-yellow-500/5"
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-md",
                            isCompleted ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"
                          )}>
                            {ref.username.substring(0, 2).toUpperCase()}
                          </div>
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black italic text-sm truncate">{ref.username}</p>
                          <p className="text-xs text-muted-foreground font-bold uppercase mt-0.5">
                            {isCompleted ? (
                              <>✓ Joined {new Date(ref.joined_at).toLocaleDateString()}</>
                            ) : (
                              <>Pending since {new Date(ref.joined_at).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground font-bold uppercase">Reward</p>
                          <p className="font-black text-primary text-sm">
                            {isCompleted ? '+5.00 SC' : 'Pending'}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "font-black italic uppercase text-[10px] shrink-0",
                            isCompleted ? "bg-green-500/20 text-green-600 hover:bg-green-500/30" : "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"
                          )}
                        >
                          {isCompleted ? <><CheckCircle2 className="w-3 h-3 mr-1" />Completed</> : <><Clock className="w-3 h-3 mr-1" />Pending</>}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-muted/50" />
                </div>
                <div>
                  <p className="font-black italic uppercase text-muted-foreground text-lg">No Referrals Yet</p>
                  <p className="text-sm text-muted-foreground/70 font-bold uppercase tracking-widest mt-2">
                    Share your link above to start earning!
                  </p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  className="mt-6 font-black italic uppercase"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy Link to Start
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Referrals;
