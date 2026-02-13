import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Search, Ticket, Zap, Info } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Sportsbook = () => {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [betSlip, setBetSlip] = useState<any[]>([]);
  const [wager, setWager] = useState(10);
  const { wallet, currency } = useWallet();

  useEffect(() => {
    fetch('/api/sportsbook/games')
      .then(res => res.json())
      .then(res => {
        if (res.success) setGames(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const addToSlip = (game: any, pick: string) => {
    if (betSlip.find(p => p.gameId === game.id)) {
      setBetSlip(betSlip.map(p => p.gameId === game.id ? { ...p, pick } : p));
    } else {
      setBetSlip([...betSlip, { gameId: game.id, game, pick }]);
    }
  };

  const handlePlaceBet = async () => {
    if (currency !== 'SC') {
      toast({ title: "SC Only", description: "Sportsbook betting is exclusive to Sweeps Coins.", variant: "destructive" });
      return;
    }
    
    if (betSlip.length < 3) {
      toast({ title: "Parlay Required", description: "Minimum 3 picks for a parlay bet.", variant: "destructive" });
      return;
    }

    const res = await fetch('/api/sportsbook/parlay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ picks: betSlip, bet: wager })
    });
    const data = await res.json();
    
    if (data.success) {
      toast({ title: "Bet Placed!", description: `Potential Payout: ${data.data.potentialPayout} SC` });
      setBetSlip([]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/20 text-primary border-none">
            <TrendingUp className="w-3 h-3 mr-1" /> Live Odds Powered by KrazyAI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">SPORTS<span className="text-primary">BOOK</span></h1>
          <p className="text-muted-foreground font-medium text-lg">SC-only parlay bets. Live spreads and live lines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {['All Sports', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis'].map(sport => (
              <Button key={sport} variant="outline" size="sm" className="rounded-full whitespace-nowrap px-6 font-bold">
                {sport}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-3xl" />)
            ) : (
              games.map((game) => (
                <Card key={game.id} className="border-border/50 bg-muted/20 overflow-hidden">
                  <div className="bg-muted/50 px-6 py-2 flex justify-between items-center border-b border-border/50">
                    <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{game.sport} • {game.time}</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-primary animate-pulse">LIVE</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xl">{game.homeTeam}</span>
                          <span className="font-mono text-muted-foreground">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xl">{game.awayTeam}</span>
                          <span className="font-mono text-muted-foreground">0</span>
                        </div>
                      </div>

                      <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase text-center">Spread</p>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" onClick={() => addToSlip(game, 'home-spread')} className="font-mono">{game.spread}</Button>
                            <Button variant="outline" size="sm" onClick={() => addToSlip(game, 'away-spread')} className="font-mono">+{game.spread.replace('-', '')}</Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase text-center">Over/Under</p>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" onClick={() => addToSlip(game, 'over')} className="font-mono">O {game.overUnder}</Button>
                            <Button variant="outline" size="sm" onClick={() => addToSlip(game, 'under')} className="font-mono">U {game.overUnder}</Button>
                          </div>
                        </div>
                        <div className="space-y-1 hidden sm:block">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase text-center">Moneyline</p>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" onClick={() => addToSlip(game, 'home-ml')} className="font-mono">-110</Button>
                            <Button variant="outline" size="sm" onClick={() => addToSlip(game, 'away-ml')} className="font-mono">+110</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Bet Slip */}
        <div className="space-y-6">
          <Card className="border-primary/20 sticky top-24">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                BET SLIP
              </CardTitle>
              <CardDescription className="text-xs">Minimum 3 picks for Parlay</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-3 min-h-[100px]">
                {betSlip.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <p className="text-sm text-muted-foreground">No picks selected.</p>
                    <p className="text-xs text-muted-foreground italic">Add 3 or more picks to place a parlay.</p>
                  </div>
                ) : (
                  betSlip.map((pick, i) => (
                    <div key={i} className="bg-muted/50 p-3 rounded-xl border border-border flex justify-between items-start group">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary uppercase">{pick.pick.replace('-', ' ')}</p>
                        <p className="text-sm font-black">{pick.game.homeTeam} vs {pick.game.awayTeam}</p>
                      </div>
                      <button onClick={() => setBetSlip(betSlip.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                        <Zap className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {betSlip.length > 0 && (
                <div className="p-4 bg-muted border-t border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Wager (SC)</span>
                    <input 
                      type="number" 
                      value={wager}
                      onChange={(e) => setWager(Number(e.target.value))}
                      className="w-20 bg-background border border-border rounded text-right px-2 font-mono font-bold"
                    />
                  </div>
                  <div className="flex justify-between items-center text-primary">
                    <span className="text-sm font-bold italic">Potential Payout</span>
                    <span className="text-xl font-black">{(wager * (betSlip.length * 2.5)).toFixed(2)} SC</span>
                  </div>
                  <Button onClick={handlePlaceBet} className="w-full h-12 font-black italic tracking-widest">PLACE PARLAY BET</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" /> Sportsbook Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] text-muted-foreground space-y-2">
              <p>• All bets are SC-only.</p>
              <p>• Minimum 3 legs for any parlay.</p>
              <p>• Odds are subject to change until bet is placed.</p>
              <p>• Max payout: 10,000 SC per bet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sportsbook;
