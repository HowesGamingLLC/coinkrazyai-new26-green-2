import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useWallet } from '@/hooks/use-wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BetSelector } from './BetSelector';
import { WinModal } from './WinModal';
import { apiCall } from '@/lib/api';

interface GameConfig {
  id: number;
  name: string;
  description: string;
  image_url: string;
  embed_url: string;
  is_sweepstake: boolean;
  max_win_amount: number;
  min_bet: number;
  max_bet: number;
  currency: string;
}

interface ExternalGamePlayerProps {
  gameId: number;
}

export const ExternalGamePlayer: React.FC<ExternalGamePlayerProps> = ({ gameId }) => {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastWin, setLastWin] = useState<{
    game_name: string;
    win_amount: number;
  } | null>(null);

  // Load game config on mount
  useEffect(() => {
    const loadGameConfig = async () => {
      try {
        setLoading(true);
        const response = await apiCall<any>(`/games/${gameId}/config`);
        setGameConfig(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load game');
        toast.error('Failed to load game configuration');
      } finally {
        setLoading(false);
      }
    };

    loadGameConfig();
  }, [gameId]);

  const handleSpin = async (betAmount: number) => {
    if (!user) {
      toast.error('You must be logged in to play');
      return;
    }

    try {
      setIsSpinning(true);

      // Simulate win/loss (in production, this would come from game server)
      // For now, 40% chance to win with random amount
      const winChance = Math.random();
      let winAmount = 0;

      if (winChance > 0.6) {
        // 40% win rate
        winAmount = Math.random() * (gameConfig?.max_win_amount || 20);
        winAmount = Math.round(winAmount * 100) / 100; // Round to 2 decimals
        
        // Cap at max_win
        if (winAmount > (gameConfig?.max_win_amount || 20)) {
          winAmount = gameConfig?.max_win_amount || 20;
        }
      }

      // Process spin via API
      const response = await apiCall<any>('/games/spin', {
        method: 'POST',
        body: JSON.stringify({
          game_id: gameId,
          bet_amount: betAmount,
          win_amount: winAmount
        })
      });

      if (response.success) {
        const spinData = response.data;

        // Update wallet
        await refreshWallet();

        // Show result toast
        if (winAmount > 0) {
          toast.success(`You won ${winAmount.toFixed(2)} SC!`);
          setLastWin({
            game_name: spinData.game_name,
            win_amount: winAmount
          });
          setShowWinModal(true);
        } else {
          toast.info(`You lost ${betAmount.toFixed(2)} SC`);
        }

        console.log('[Game] Spin result:', spinData);
      } else {
        toast.error(response.error || 'Spin failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process spin');
      console.error('[Game] Spin error:', err);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleShareWin = async (platform: string) => {
    if (!user || !lastWin) return;

    try {
      // Record social share
      await apiCall<any>('/social/share', {
        method: 'POST',
        body: JSON.stringify({
          game_id: gameId,
          game_name: lastWin.game_name,
          win_amount: lastWin.win_amount,
          platform: platform
        })
      });
    } catch (err) {
      console.error('[Social] Share error:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !gameConfig) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>{error || 'Game not found'}</AlertDescription>
      </Alert>
    );
  }

  const scBalance = wallet?.sweepsCoins || 0;

  return (
    <div className="space-y-6">
      {/* Game Info */}
      <Card>
        <CardHeader>
          <CardTitle>{gameConfig.name}</CardTitle>
          <CardDescription>{gameConfig.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameConfig.image_url && (
            <img
              src={gameConfig.image_url}
              alt={gameConfig.name}
              className="w-full rounded-lg object-cover aspect-video"
            />
          )}

          {gameConfig.is_sweepstake && (
            <Alert>
              <AlertDescription>
                ✨ This is a sweepstake game. Winnings are paid in Sweeps Coins (SC).
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bet Selector */}
        <div className="lg:col-span-1">
          <BetSelector
            minBet={gameConfig.min_bet}
            maxBet={gameConfig.max_bet}
            currentBalance={scBalance}
            onBetSelect={handleSpin}
            isProcessing={isSpinning}
          />
        </div>

        {/* Game Display */}
        <div className="lg:col-span-2">
          <Card className="h-full bg-black border-slate-800 flex flex-col min-h-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Game Stream</span>
               </div>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8 text-slate-400 hover:text-white"
                 onClick={() => setRefreshKey(prev => prev + 1)}
               >
                 <Loader2 className={cn("w-4 h-4", isSpinning && "animate-spin")} />
               </Button>
            </div>
            <div className="flex-1 relative">
              {gameConfig.embed_url ? (
                <iframe
                  key={refreshKey}
                  src={gameConfig.embed_url}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-read; clipboard-write; microphone; camera; midi; geolocation"
                  allowFullScreen
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6">
                  <p className="text-lg font-semibold">{gameConfig.name}</p>
                  <p className="text-sm">Game content would display here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Win Modal */}
      <WinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        gameName={gameConfig.name}
        winAmount={lastWin?.win_amount || 0}
        playerUsername={user?.username || ''}
        referralLink={`${window.location.origin}?ref=${user?.id}`}
        onShare={handleShareWin}
      />
    </div>
  );
};
