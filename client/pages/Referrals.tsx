import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, Copy, Share2, Gift, TrendingUp, Loader2, Link as LinkIcon } from 'lucide-react';
import { referrals as referralsApi } from '@/lib/api';

const Referrals = () => {
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnedSC: 0,
    totalEarnedGC: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);
      const [linkRes, statsRes] = await Promise.all([
        referralsApi.getLink(),
        referralsApi.getStats()
      ]);

      if (linkRes.success) {
        setReferralLink(linkRes.data.link);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      toast.error('Failed to load referral information');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setIsCopying(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black italic">{stats.totalReferrals}</p>
            <p className="text-xs text-green-500 font-bold mt-1">+{stats.activeReferrals} Active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Total Earned SC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black italic text-primary">{stats.totalEarnedSC.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Sweepstakes Coins</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Total Earned GC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black italic text-secondary">{stats.totalEarnedGC.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Gold Coins</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-950 border-4 border-primary/20 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5 pointer-events-none" />
        <CardHeader className="relative z-10 text-center space-y-4 pt-10">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border-2 border-primary/30">
            <LinkIcon className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black italic uppercase tracking-tight text-white">Your Magic Referral Link</CardTitle>
            <CardDescription className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Share this link with your friends. When they register and verify, you get paid!
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 max-w-2xl mx-auto pb-10">
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-900 border-2 border-white/10 rounded-xl p-4 font-mono text-sm text-slate-300 break-all select-all">
              {referralLink || 'Generating your link...'}
            </div>
            <Button 
              onClick={copyToClipboard}
              className="h-auto px-6 font-black italic uppercase"
            >
              {isCopying ? 'COPIED!' : <><Copy className="w-4 h-4 mr-2" /> COPY</>}
            </Button>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
              <Share2 className="w-4 h-4 mr-2" /> Share on X
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
              <Share2 className="w-4 h-4 mr-2" /> Share on Facebook
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-black italic uppercase">How it works</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Send Invite', desc: 'Share your unique referral link with your crew via social media, text, or email.' },
              { step: 2, title: 'Friend Joins', desc: 'Your friends register an account using your link and complete their KYC verification.' },
              { step: 3, title: 'Get Rewarded', desc: 'Once your friend makes their first coin purchase, we drop 5.00 SC and 10,000 GC into your wallet!' }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-xl text-primary-foreground shrink-0 shadow-lg">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-lg leading-tight">{item.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black italic uppercase text-slate-400">Recent Referrals</h2>
          <Card className="border-border/50">
            <CardContent className="p-0">
               <div className="divide-y divide-border/50">
                  {stats.totalReferrals > 0 ? (
                    <div className="p-8 text-center text-muted-foreground font-bold italic">
                      Coming soon: List of your referred friends and their status.
                    </div>
                  ) : (
                    <div className="p-12 text-center space-y-4">
                       <Users className="w-12 h-12 text-muted/30 mx-auto" />
                       <div>
                         <p className="font-black italic uppercase text-muted-foreground">No referrals yet</p>
                         <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">Be the first to invite your crew!</p>
                       </div>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
