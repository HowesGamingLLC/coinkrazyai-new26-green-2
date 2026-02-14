import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Coins, Trophy, Info, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoinAnimation } from '@/components/CoinAnimation';
import { ApiClient } from '@/lib/api';

const SYMBOL_MAP: Record<string, string> = {
  cherry: '🍒',
  lemon: '🍋',
  orange: '🍊',
  plum: '🍇',
  bell: '🔔',
  diamond: '💎',
  seven: '7️⃣'
};

const Slots = () => {
  const { wallet, currency, refreshWallet } = useWallet();
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([
    ['cherry', 'lemon', 'orange'],
    ['bell', 'seven', 'diamond'],
    ['plum', 'cherry', 'bell']
  ]);
  const [winnings, setWinnings] = useState(0);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await ApiClient.getSlotsConfig();
        if (res.success) {
          setConfig(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch slots config:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleSpin = async () => {
    if (isSpinning) return;
    if (!wallet) {
      toast({ title: "Error", description: "Wallet not loaded", variant: "destructive" });
      return;
    }

    // Check balance
    const balance = currency === 'GC' ? wallet.goldCoins : wallet.sweepsCoins;
    if (balance < bet) {
      toast({ title: "Insufficient Balance", description: `You need ${bet} ${currency}. You have ${balance}.`, variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setWinnings(0);
    setShowWinAnimation(false);

    try {
      const res = await ApiClient.spinSlots(1, bet);
      const data = res;

      if (data.success) {
        // Simulate reel spinning delay
        setTimeout(() => {
          if (data.data?.symbols) {
            const symbols = data.data.symbols.split(',');
            setReels([
              [symbols[0], symbols[3], symbols[6]],
              [symbols[1], symbols[4], symbols[7]],
              [symbols[2], symbols[5], symbols[8]]
            ]);
          }
          setIsSpinning(false);

          if (data.data?.winnings > 0) {
            setWinnings(data.data.winnings);
            setShowWinAnimation(true);
            toast({
              title: "🎉 BIG WIN!",
              description: `You won ${data.data.winnings} ${currency}!`,
              className: "bg-primary text-primary-foreground font-bold"
            });
          } else {
            toast({
              title: "No Win",
              description: "Better luck next time!",
              variant: "default"
            });
          }

          // Refresh wallet after a short delay
          setTimeout(refreshWallet, 500);
        }, 2000);
      } else {
        setIsSpinning(false);
        toast({ title: "Error", description: data.error || "Spin failed", variant: "destructive" });
      }
    } catch (e) {
      setIsSpinning(false);
      toast({ title: "Error", description: "Spin failed. Try again.", variant: "destructive" });
      console.error('Spin error:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CoinAnimation trigger={showWinAnimation} />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/20 text-primary border-none">
            <Zap className="w-3 h-3 mr-1 fill-primary" /> SlotsAI RTP Active: 96.5%
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic">KRAZY <span className="text-primary">SEVENS</span></h1>
          <p className="text-muted-foreground font-medium">Classic 3x3 Slots with AI-powered Jackpots.</p>
        </div>
        
        <Card className="bg-muted/50 border-border p-4 flex gap-8">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">WINNINGS</p>
            <p className="text-2xl font-black text-primary">+{winnings} {currency}</p>
          </div>
          <div className="border-l border-border pl-8">
            <p className="text-xs font-bold text-muted-foreground uppercase">BALANCE</p>
            <p className="text-2xl font-black">
              {currency === 'GC' ? wallet?.goldCoins.toLocaleString() : wallet?.sweepsCoins.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Slots Board */}
      <div className="relative p-8 bg-gradient-to-b from-muted to-background rounded-3xl border-4 border-border shadow-2xl">
        <div className="grid grid-cols-3 gap-4 h-64 md:h-80">
          {reels.map((column, colIdx) => (
            <div key={colIdx} className="bg-card border-2 border-border/50 rounded-2xl overflow-hidden relative flex flex-col justify-around">
              <AnimatePresence mode="wait">
                {column.map((symbol, rowIdx) => (
                  <motion.div
                    key={`${symbol}-${rowIdx}-${isSpinning}`}
                    initial={isSpinning ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ 
                      duration: 0.1, 
                      repeat: isSpinning ? Infinity : 0,
                      delay: colIdx * 0.1
                    }}
                    className="flex items-center justify-center text-5xl md:text-7xl"
                  >
                    {SYMBOL_MAP[symbol]}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Spinning Overlay */}
              {isSpinning && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Win Lines Visualization (Simplified) */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="bg-muted p-6 rounded-3xl border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase">BET AMOUNT</p>
            <div className="flex items-center gap-2">
              {[10, 50, 100, 500].map(val => (
                <Button 
                  key={val}
                  size="sm"
                  variant={bet === val ? 'default' : 'outline'}
                  onClick={() => setBet(val)}
                  className="font-bold"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button 
          size="lg"
          onClick={handleSpin}
          disabled={isSpinning}
          className={cn(
            "w-full md:w-64 h-16 text-2xl font-black italic tracking-wider transition-all shadow-lg shadow-primary/20",
            isSpinning ? "opacity-50" : "hover:scale-105"
          )}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN'}
        </Button>
      </div>

      {/* Paytable Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
          <p className="text-4xl mb-2">7️⃣7️⃣7️⃣</p>
          <p className="text-xs font-bold text-muted-foreground uppercase">100x Bet</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
          <p className="text-4xl mb-2">💎💎💎</p>
          <p className="text-xs font-bold text-muted-foreground uppercase">50x Bet</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
          <p className="text-4xl mb-2">🔔🔔🔔</p>
          <p className="text-xs font-bold text-muted-foreground uppercase">10x Bet</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-center gap-2">
          <Info className="w-5 h-5 text-muted-foreground" />
          <p className="text-xs font-bold text-muted-foreground uppercase">View Full Paytable</p>
        </div>
      </div>
    </div>
  );
};

export default Slots;
