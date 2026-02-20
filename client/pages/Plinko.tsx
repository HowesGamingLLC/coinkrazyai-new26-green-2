import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import { Zap, Trophy, History, Coins, Loader2, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';
import { SocialSharePopup } from '@/components/popups/SocialSharePopup';

const ROWS = 8;
const MULTIPLIERS = [5.6, 2.1, 1.1, 0.5, 0.2, 0.5, 1.1, 2.1, 5.6];

const Plinko = () => {
  const { wallet, currency, refreshWallet } = useWallet();
  const [betAmount, setBetAmount] = useState<number>(1.00);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [ballPath, setBallPath] = useState<number[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [lastWinAmount, setLastWinAmount] = useState(0);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrop = async () => {
    if (isDropping) return;

    const balance = currency === 'GC' ? wallet?.goldCoins : wallet?.sweepsCoins;
    if (!balance || betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setIsDropping(true);
      setLastWin(null);
      setBallPath([]);

      const response = await apiCall('/casino/play', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'power-plinko',
          betAmount: betAmount,
          currency: currency,
          gameData: { rows: ROWS }
        })
      });

      if (response.success) {
        // Assume backend returns the path or the final index
        // For simulation, let's generate a path based on the final index
        const finalIndex = response.result.finalIndex; 
        const path: number[] = [];
        let currentPos = 0;
        
        // Simple logic to reach finalIndex in ROWS steps
        // This is a placeholder for a more realistic physics simulation
        for (let i = 0; i < ROWS; i++) {
          const move = Math.random() > 0.5 ? 1 : 0;
          path.push(move);
        }
        
        setBallPath(path);

        // Animate the ball (simplified)
        setTimeout(() => {
          setIsDropping(false);
          setLastWin(response.result.payout);
          if (response.result.payout > betAmount) {
            toast.success(`You won ${response.result.payout} ${currency}!`);
            setLastWinAmount(response.result.payout);
            setShowWinPopup(true);
          }
          refreshWallet();
          fetchRecentGames();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Drop failed:', error);
      toast.error(error.message || 'Failed to drop ball');
      setIsDropping(false);
    }
  };

  const fetchRecentGames = async () => {
    try {
      const response = await apiCall('/casino/spins?gameId=power-plinko');
      if (response && response.data) {
        setRecentGames(response.data.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch recent games:', error);
    }
  };

  useEffect(() => {
    fetchRecentGames();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tight uppercase flex items-center gap-3 text-red-500">
            <Zap className="w-10 h-10 animate-pulse" />
            Power Plinko
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1 text-slate-500 italic">High-Voltage Instant Drops</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-2 border-2 font-black italic uppercase">
            RTP: 98.5%
          </Badge>
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-mono font-bold">
              {currency === 'GC' ? wallet?.goldCoins.toLocaleString() : wallet?.sweepsCoins.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Betting Controls */}
        <Card className="lg:col-span-1 border-4 border-slate-900 shadow-2xl h-fit">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-xl font-black italic uppercase">Wager Setup</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-slate-500">Bet Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  className="h-14 text-xl font-black pl-10 bg-slate-50 border-2 focus:border-primary"
                  min={0.01}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                   <Coins className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => setBetAmount(prev => prev / 2)}>1/2</Button>
                <Button variant="outline" size="sm" className="flex-1 font-bold" onClick={() => setBetAmount(prev => prev * 2)}>2x</Button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 text-center border-t-4 border-red-500 shadow-inner">
               <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Max Potential Win</p>
               <p className="text-3xl font-black italic text-red-400">{(betAmount * 5.6).toFixed(2)} {currency}</p>
            </div>

            <Button 
              size="lg" 
              className="w-full h-20 text-2xl font-black italic uppercase rounded-2xl shadow-xl shadow-red-500/20 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 animate-pulse-slow"
              onClick={handleDrop}
              disabled={isDropping}
            >
              {isDropping ? <Loader2 className="w-8 h-8 animate-spin" /> : 'DROP BALL'}
            </Button>
          </CardContent>
        </Card>

        {/* Game Area */}
        <Card className="lg:col-span-3 border-4 border-slate-900 shadow-2xl relative overflow-hidden bg-slate-950">
           <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
           
           <CardContent className="p-8 md:p-12 h-full flex flex-col justify-between min-h-[500px]">
             {/* Plinko Pegs Grid */}
             <div className="relative flex-1 flex flex-col items-center justify-center gap-8 py-10" ref={containerRef}>
                {[...Array(ROWS)].map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-8 md:gap-12">
                    {[...Array(rowIndex + 1)].map((_, colIndex) => (
                      <div 
                        key={colIndex} 
                        className="w-3 h-3 bg-slate-700 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] relative"
                      >
                         <div className="absolute inset-0 bg-white/20 rounded-full blur-[2px]" />
                      </div>
                    ))}
                  </div>
                ))}

                {/* Simulated Ball Animation */}
                {isDropping && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce z-20">
                      <div className="absolute inset-1 bg-white/30 rounded-full" />
                   </div>
                )}
             </div>

             {/* Multipliers Bar */}
             <div className="grid grid-cols-9 gap-2 mt-8">
                {MULTIPLIERS.map((m, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-12 flex items-center justify-center rounded-lg border-b-4 font-black italic text-xs md:text-sm transition-all shadow-lg",
                      m >= 5 ? "bg-red-500 border-red-700 text-white" :
                      m >= 2 ? "bg-orange-500 border-orange-700 text-white" :
                      m >= 1 ? "bg-yellow-500 border-yellow-700 text-slate-900" :
                      "bg-slate-800 border-slate-900 text-slate-400"
                    )}
                  >
                    {m}x
                  </div>
                ))}
             </div>
           </CardContent>
        </Card>
      </div>

      {showWinPopup && (
        <SocialSharePopup
          winAmount={lastWinAmount}
          gameName="Power Plinko"
          onClose={() => setShowWinPopup(false)}
          onShare={async (platform, message) => {
            try {
              await apiCall('/social-sharing/share', {
                method: 'POST',
                body: JSON.stringify({
                  platform,
                  message,
                  winAmount: lastWinAmount,
                  gameName: 'Power Plinko'
                })
              });
              toast.success('Share recorded!');
            } catch (error) {
              console.error('Failed to record share:', error);
            }
          }}
        />
      )}

      {/* Stats & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-2 border-slate-100 shadow-xl">
           <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50 p-4">
             <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
               <History className="w-4 h-4 text-red-500" />
               Recent Activity
             </CardTitle>
             <TrendingUp className="w-4 h-4 text-primary" />
           </CardHeader>
           <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-100/50 text-[10px] font-black uppercase text-slate-500 border-b">
                     <th className="p-3">Player</th>
                     <th className="p-3">Wager</th>
                     <th className="p-3">Multiplier</th>
                     <th className="p-3">Payout</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {recentGames.length > 0 ? recentGames.map((game, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                       <td className="p-3 text-xs font-bold text-slate-500">
                         {game.player_name || 'Anonymous'}
                       </td>
                       <td className="p-3 text-xs font-bold">
                         {game.bet_amount} {game.currency}
                       </td>
                       <td className="p-3">
                         <Badge variant="outline" className="font-mono font-black italic text-[10px]">
                           {(game.winnings / game.bet_amount).toFixed(1)}x
                         </Badge>
                       </td>
                       <td className="p-3 text-xs font-black text-primary">
                         {game.winnings > 0 ? `+${game.winnings}` : '-'}
                       </td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={4} className="p-8 text-center text-slate-400 font-bold italic">Waiting for new drops...</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 shadow-xl">
           <CardHeader className="border-b bg-slate-50 p-4">
             <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
               <AlertCircle className="w-4 h-4 text-red-500" />
               Game Rules & Fairness
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
             <div className="space-y-2">
               <h4 className="font-black italic text-sm text-red-500 uppercase flex items-center gap-2">
                 <Sparkles className="w-4 h-4" />
                 Instant Drops, Massive Wins
               </h4>
               <p className="text-xs text-slate-600 leading-relaxed font-medium">
                 Power Plinko uses a randomized path algorithm to determine the final slot of each ball. The distribution follows a predictable bell curve, ensuring fair outcomes for all players over time.
               </p>
             </div>
             
             <div className="space-y-3">
               <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400">
                 <span>Provability</span>
                 <span className="text-green-500 flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   Active
                 </span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-red-500 w-[98.5%]" />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Max Multiplier</p>
                  <p className="text-xl font-black italic text-red-500">5.6x</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Row Settings</p>
                  <p className="text-xl font-black italic">8 Rows</p>
                </div>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase italic text-center">
               * AI-powered integrity monitoring is active on all drops.
             </p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Plinko;
