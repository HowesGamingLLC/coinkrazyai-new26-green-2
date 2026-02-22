import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Crown, Zap, Shield, Gift, ChevronRight, Lock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const VIP_TIERS = [
  {
    name: 'Bronze',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    icon: Star,
    requirement: '0 SC',
    perks: ['2% Weekly Cashback', 'Daily Bonus Multiplier x1.1', 'Standard Support']
  },
  {
    name: 'Silver',
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
    icon: Shield,
    requirement: '5,000 SC Playthrough',
    perks: ['5% Weekly Cashback', 'Daily Bonus Multiplier x1.25', 'Priority Support', 'Birthday Bonus']
  },
  {
    name: 'Gold',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    icon: Crown,
    requirement: '25,000 SC Playthrough',
    perks: ['8% Weekly Cashback', 'Daily Bonus Multiplier x1.5', 'Personal Account Manager', 'Exclusive Tournament Access']
  },
  {
    name: 'Platinum',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    icon: Trophy,
    requirement: '100,000 SC Playthrough',
    perks: ['12% Weekly Cashback', 'Daily Bonus Multiplier x2.0', 'Instant Withdrawals', 'Custom Physical Gifts', 'VIP Event Invites']
  }
];

const VIP = () => {
  const { user } = useAuth();

  // Dynamic VIP progress from user data
  const currentTier = user?.vip_tier || 'Bronze';
  const currentSCPlaythrough = user?.total_wagered || 0;

  // Calculate next tier info
  let nextTier = 'Silver';
  let nextTierRequirement = 5000;

  if (currentTier === 'Silver') {
    nextTier = 'Gold';
    nextTierRequirement = 25000;
  } else if (currentTier === 'Gold') {
    nextTier = 'Platinum';
    nextTierRequirement = 100000;
  } else if (currentTier === 'Platinum') {
    nextTier = 'Elite'; // Max tier reached or hypothetical next
    nextTierRequirement = currentSCPlaythrough;
  }

  const progressToNext = Math.min(100, Math.floor((currentSCPlaythrough / nextTierRequirement) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* VIP Status Hero */}
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 md:p-16 border-4 border-yellow-500/20 shadow-[0_0_80px_rgba(234,179,8,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5">
              <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-yellow-500 font-black uppercase tracking-widest text-[10px]">The Elite Circle</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white leading-none">
                YOUR VIP <br />
                <span className="text-yellow-500">EXPERIENCE</span>
              </h1>
              <p className="text-lg text-slate-400 font-bold uppercase tracking-tight italic">
                Level up your status and unlock exclusive rewards, personal service, and massive bonuses!
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1">Current Progress</p>
                    <div className="flex items-center gap-3">
                       <p className="text-3xl font-black italic">{currentTier}</p>
                       <ChevronRight className="w-6 h-6 text-slate-700" />
                       <p className="text-xl font-black italic text-slate-500">{nextTier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black italic">{progressToNext}%</p>
                  </div>
               </div>
               <Progress value={progressToNext} className="h-3 bg-slate-900" />
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>{currentSCPlaythrough.toLocaleString()} SC</span>
                  <span>{nextTierRequirement.toLocaleString()} SC</span>
               </div>
            </div>
          </div>

          <div className="w-full max-w-[300px] aspect-square relative group">
             <div className="absolute inset-0 bg-yellow-500/20 blur-3xl animate-pulse" />
             <div className="relative z-10 w-full h-full bg-slate-900 border-4 border-yellow-500/30 rounded-full flex flex-col items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Crown className="w-32 h-32 text-yellow-500" />
                <p className="font-black italic text-2xl uppercase mt-2">VIP CLUB</p>
             </div>
          </div>
        </div>
      </section>

      {/* VIP Perks Grid */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black italic uppercase text-center">Elite Membership Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {VIP_TIERS.map((tier) => (
             <Card key={tier.name} className={cn("border-2 relative overflow-hidden group hover:scale-[1.02] transition-all", tier.border, tier.bg)}>
                {currentTier !== tier.name && tier.name !== 'Bronze' && (
                  <div className="absolute top-4 right-4 z-20">
                    <Lock className="w-5 h-5 text-white/20" />
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                   <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 shadow-xl", tier.border, tier.bg)}>
                      <tier.icon className={cn("w-8 h-8", tier.color)} />
                   </div>
                   <CardTitle className={cn("text-2xl font-black italic uppercase", tier.color)}>{tier.name}</CardTitle>
                   <CardDescription className="font-black text-[10px] uppercase tracking-widest">{tier.requirement}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-8">
                   {tier.perks.map((perk) => (
                     <div key={perk} className="flex items-center gap-2 text-xs font-bold uppercase italic text-slate-300">
                        <Zap className="w-3 h-3 text-yellow-500 shrink-0" />
                        <span>{perk}</span>
                     </div>
                   ))}
                </CardContent>
                <CardFooter>
                   <Button variant="outline" className="w-full border-2 font-black italic uppercase text-xs">
                      {currentTier === tier.name ? 'CURRENT TIER' : 'VIEW DETAILS'}
                   </Button>
                </CardFooter>
             </Card>
           ))}
        </div>
      </section>

      {/* Featured Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-slate-900/50 border border-border p-8 rounded-[2rem] space-y-4 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-black italic uppercase">Weekly Cashback</h3>
            <p className="text-sm text-slate-400 font-bold uppercase">Get a percentage of your gameplay back every Monday, no strings attached!</p>
         </div>

         <div className="bg-slate-900/50 border border-border p-8 rounded-[2rem] space-y-4 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Gift className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-black italic uppercase">Milestone Rewards</h3>
            <p className="text-sm text-slate-400 font-bold uppercase">Massive coin drops every time you hit a new VIP level or sub-level!</p>
         </div>

         <div className="bg-slate-900/50 border border-border p-8 rounded-[2rem] space-y-4 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <Shield className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-black italic uppercase">VIP Support</h3>
            <p className="text-sm text-slate-400 font-bold uppercase">Dedicated host and priority tickets to ensure your experience is flawless.</p>
         </div>
      </section>

      {/* FAQ / How to join */}
      <Card className="bg-card border-border p-12 rounded-[3rem] text-center space-y-6">
         <h2 className="text-4xl font-black italic uppercase tracking-tighter">How do I join the Club?</h2>
         <p className="text-lg text-muted-foreground font-bold max-w-2xl mx-auto">
            Membership is automatic! Every spin you take and every bet you place earns you XP. Once you hit the requirement for the next tier, you'll be instantly promoted by our VIP Manager AI.
         </p>
         <div className="pt-6">
            <Button size="lg" className="h-16 px-12 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xl italic rounded-2xl shadow-xl shadow-yellow-500/20">
               START PLAYING NOW
            </Button>
         </div>
      </Card>
    </div>
  );
};

export default VIP;
