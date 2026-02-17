import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { sportsbook } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Trophy, Star, Zap, Clock, Users, ArrowRight, Coins, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { SportsEvent } from '@shared/api';
import { MIN_BET_SC, MAX_BET_SC } from '@shared/constants';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Sportsbook = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [selectedOdds, setSelectedOdds] = useState<number>(0);
  const [activeSport, setActiveSport] = useState<string>("All");

  const sports = ["All", "Football", "Basketball", "Soccer", "Tennis", "Baseball", "MMA"];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await sportsbook.getLiveGames();
        setEvents(response.data || []);
      } catch (error: any) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load sports events');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handlePlaceBet = async () => {
    if (!selectedEvent) return;
    
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < MIN_BET_SC) {
      toast.error(`Bet amount must be at least ${MIN_BET_SC} SC`);
      return;
    }

    if (amount > MAX_BET_SC) {
      toast.error(`Bet amount cannot exceed ${MAX_BET_SC} SC`);
      return;
    }

    if (Number(user?.sc_balance || 0) < amount) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await sportsbook.placeBet(selectedEvent.id, amount, selectedOdds);
      toast.success('Bet placed successfully! Good luck! 🍀');
      setSelectedEvent(null);
      setBetAmount("");
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bet');
    }
  };

  const filteredEvents = activeSport === "All" 
    ? events 
    : events.filter(e => e.sport === activeSport);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
        <p className="font-black italic text-yellow-500 animate-pulse tracking-widest">LOADING LIVE ODDS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header with High Impact Branding */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 border-2 border-white/5 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-500 font-black uppercase text-[10px] tracking-widest">Live Betting Center</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic text-white uppercase leading-none">
              SPORTS <span className="text-blue-500">ARENA</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-tight max-w-md text-sm">
              Live odds, parlay boosters, and instant payouts on all major leagues!
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
               <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Active Markets</p>
               <p className="text-2xl font-black text-white italic">{events.length}</p>
             </div>
             <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 text-center min-w-[120px]">
               <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Total Pooled</p>
               <p className="text-2xl font-black text-blue-500 italic">4.2M SC</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Betting Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sports Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sports.map(sport => (
              <Button
                key={sport}
                variant={activeSport === sport ? 'default' : 'outline'}
                onClick={() => setActiveSport(sport)}
                className={cn(
                  "font-black uppercase italic text-xs h-10 px-6 rounded-xl transition-all",
                  activeSport === sport 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                    : "border-white/5 text-slate-400 hover:bg-white/5"
                )}
              >
                {sport}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.map(event => (
              <Card 
                key={event.id} 
                className={cn(
                  "bg-slate-950 border-2 transition-all duration-300 hover:border-blue-500/30 group",
                  selectedEvent?.id === event.id ? "border-blue-500 shadow-lg shadow-blue-500/10" : "border-white/5"
                )}
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-lg border border-white/10">
                           <Trophy className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{event.sport}</p>
                          <h3 className="text-xl font-black italic text-white uppercase">{event.event_name}</h3>
                        </div>
                      </div>
                      <Badge className={cn(
                        "font-black uppercase italic text-[10px] px-3 py-1",
                        event.status === 'Live' ? "bg-red-600 animate-pulse" : "bg-slate-800"
                      )}>
                        {event.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Win Home */}
                      <button 
                        onClick={() => {
                          setSelectedEvent(event);
                          setSelectedOdds(1.85);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                          selectedEvent?.id === event.id && selectedOdds === 1.85
                            ? "bg-blue-600 border-blue-400 shadow-lg"
                            : "bg-slate-900 border-white/5 hover:border-white/20"
                        )}
                      >
                        <span className="text-[10px] font-black text-slate-500 uppercase mb-1">HOME</span>
                        <span className="text-lg font-black italic">1.85</span>
                      </button>

                      {/* Draw */}
                      <button 
                        onClick={() => {
                          setSelectedEvent(event);
                          setSelectedOdds(3.40);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                          selectedEvent?.id === event.id && selectedOdds === 3.40
                            ? "bg-blue-600 border-blue-400 shadow-lg"
                            : "bg-slate-900 border-white/5 hover:border-white/20"
                        )}
                      >
                        <span className="text-[10px] font-black text-slate-500 uppercase mb-1">DRAW</span>
                        <span className="text-lg font-black italic">3.40</span>
                      </button>

                      {/* Win Away */}
                      <button 
                        onClick={() => {
                          setSelectedEvent(event);
                          setSelectedOdds(2.15);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                          selectedEvent?.id === event.id && selectedOdds === 2.15
                            ? "bg-blue-600 border-blue-400 shadow-lg"
                            : "bg-slate-900 border-white/5 hover:border-white/20"
                        )}
                      >
                        <span className="text-[10px] font-black text-slate-500 uppercase mb-1">AWAY</span>
                        <span className="text-lg font-black italic">2.15</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-500 uppercase italic">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {Number(event.total_bets || 0).toLocaleString()} BETS
                      </span>
                      <span className="flex items-center gap-1 text-blue-500">
                        <TrendingUp className="w-3 h-3" />
                        {event.line_movement || 'STABLE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Q{Math.floor(Math.random() * 4) + 1} - 04:21
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-center py-20 border-4 border-dashed border-white/5 rounded-[2rem]">
                <LayoutGrid className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest">No events live for this sport</p>
              </div>
            )}
          </div>
        </div>

        {/* Betting Slip */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-950 border-4 border-blue-600 shadow-2xl sticky top-24 overflow-hidden">
            <CardHeader className="bg-blue-600 p-4 text-white italic">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Bet Slip</CardTitle>
                <div className="bg-white/20 rounded-lg px-2 py-1 text-[10px] font-black uppercase">
                  Single Bet
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!selectedEvent ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                    <Zap className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest leading-relaxed">
                    Select any odds from <br /> the left to start betting
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group">
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedEvent.sport}</p>
                      <h4 className="font-black italic text-white uppercase line-clamp-1">{selectedEvent.event_name}</h4>
                      <div className="flex items-center justify-between mt-2">
                         <span className="text-xs font-black text-slate-400 uppercase italic">Your Pick</span>
                         <span className="text-lg font-black italic text-yellow-500">@{selectedOdds.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wager (SC)</label>
                      <span className="text-xs font-black text-white italic">Bal: {Number(user?.sc_balance || 0).toFixed(2)} SC</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="h-14 bg-slate-900 border-2 border-white/10 rounded-2xl text-xl font-black italic text-white focus:border-blue-500 transition-all pl-10"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Coins className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                       {["1", "5", "10", "MAX"].map(v => (
                         <Button 
                          key={v}
                          variant="outline" 
                          size="sm" 
                          onClick={() => setBetAmount(v === "MAX" ? MAX_BET_SC.toString() : v)}
                          className="font-black italic border-white/5 hover:bg-white/5 text-[10px]"
                         >
                           {v === "MAX" ? "MAX" : `+${v}`}
                         </Button>
                       ))}
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase italic text-slate-400">
                      <span>Total Return</span>
                      <span className="text-green-500 font-black">
                        {(parseFloat(betAmount || "0") * selectedOdds).toFixed(2)} SC
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase italic text-slate-400">
                      <span>Potential Profit</span>
                      <span className="text-yellow-500 font-black">
                        {(parseFloat(betAmount || "0") * (selectedOdds - 1)).toFixed(2)} SC
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePlaceBet}
                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-xl italic rounded-2xl shadow-xl shadow-blue-600/20 border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all uppercase"
                  >
                    PLACE BET NOW
                  </Button>
                </>
              )}
            </CardContent>
            <div className="p-4 bg-slate-900 text-center">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                All bets are final and monitored by SecurityAI
              </p>
            </div>
          </Card>

          <div className="bg-blue-600/10 border-2 border-blue-600/20 rounded-3xl p-6 space-y-4">
             <div className="flex items-center gap-3">
               <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
               <h3 className="font-black italic uppercase text-white">Daily Parlay Boost</h3>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">
               Add 3+ events to your slip to earn a <span className="text-yellow-500">25% profit boost</span> automatically!
             </p>
             <Button variant="link" className="p-0 h-auto text-blue-500 font-black italic uppercase text-[10px] flex items-center gap-1 group">
               Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sportsbook;
