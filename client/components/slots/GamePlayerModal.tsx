import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BetSelector } from '@/components/external-games/BetSelector';
import { useAuth } from '@/lib/auth-context';
import { useWallet } from '@/hooks/use-wallet';
import { apiCall } from '@/lib/api';

interface GamePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: number;
    name: string;
    provider: string;
    embed_url?: string;
    image_url?: string;
    type?: string;
  };
}

interface GameConfig {
  min_bet: number;
  max_bet: number;
}

export const GamePlayerModal = ({ isOpen, onClose, game }: GamePlayerModalProps) => {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    min_bet: 0.01,
    max_bet: 100
  });

  // Load game config on mount
  useEffect(() => {
    if (isOpen && game.embed_url) {
      const loadGameConfig = async () => {
        try {
          const response = await apiCall<any>(`/games/${game.id}/config`);
          if (response.data) {
            setGameConfig({
              min_bet: response.data.min_bet || 0.01,
              max_bet: response.data.max_bet || 100
            });
          }
          setIsLoading(false);
          setHasError(false);
        } catch (error) {
          console.error('Failed to load game config:', error);
          setIsLoading(false);
          // Continue with defaults if config fails
        }
      };

      loadGameConfig();
    }
  }, [isOpen, game.id, game.embed_url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    toast.error('Failed to load game. The provider may be unavailable.');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    const iframe = document.getElementById(`game-player-iframe-${game.id}`) as HTMLIFrameElement;
    if (iframe && game.embed_url) {
      iframe.src = game.embed_url;
    }
  };

  const handleFullscreen = async () => {
    const element = document.getElementById(`game-player-container-${game.id}`);
    if (element) {
      try {
        if (!document.fullscreenElement) {
          await element.requestFullscreen();
          setIsFullscreen(true);
        } else {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      } catch (error) {
        toast.error('Fullscreen not supported');
      }
    }
  };

  const handleBetSelect = async (betAmount: number) => {
    if (!user) {
      toast.error('You must be logged in to play');
      return;
    }

    try {
      setIsSpinning(true);

      // Simulate win/loss (40% chance to win)
      const winChance = Math.random();
      let winAmount = 0;

      if (winChance > 0.6) {
        winAmount = Math.random() * Math.min(gameConfig.max_bet * 5, 20);
        winAmount = Math.round(winAmount * 100) / 100;
      }

      // Process spin via API
      const response = await apiCall<any>('/games/spin', {
        method: 'POST',
        body: JSON.stringify({
          game_id: game.id,
          bet_amount: betAmount,
          win_amount: winAmount
        })
      });

      if (response.success) {
        await refreshWallet();

        if (winAmount > 0) {
          toast.success(`🎉 You won ${winAmount.toFixed(2)} SC!`);
        } else {
          toast.info(`You lost ${betAmount.toFixed(2)} SC`);
        }
      } else {
        toast.error(response.error || 'Spin failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process spin');
      console.error('Spin error:', error);
    } finally {
      setIsSpinning(false);
    }
  };

  if (!isOpen || !game.embed_url) {
    return null;
  }

  const scBalance = wallet?.sweepsCoins || 0;
  const gcBalance = wallet?.goldCoins || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 bg-slate-900 border-slate-700">
        <DialogTitle className="sr-only">Playing {game.name}</DialogTitle>
        {/* Header with CoinKrazy Branding */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  💰 CoinKrazy
                </span>
              </div>
              <div className="border-l border-slate-600 pl-4">
                <h2 className="text-xl font-bold text-white">{game.name}</h2>
                <p className="text-xs text-slate-400">{game.provider}</p>
              </div>
            </div>

            {/* Wallet Balance Display */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-yellow-500 text-black">Gold Coins</Badge>
                  <span className="text-lg font-bold text-yellow-400">{gcBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500 text-black">Sweeps Coins</Badge>
                  <span className="text-lg font-bold text-cyan-400">{scBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-700 bg-slate-800/50">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            title="Refresh game"
            className="gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="gap-2"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            {isMuted ? 'Muted' : 'Sound'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleFullscreen}
            title="Fullscreen"
            className="gap-2"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 overflow-hidden p-6">
          {/* Game Container */}
          <div
            id={`game-player-container-${game.id}`}
            className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden relative"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                  <p className="text-white text-sm">Loading game...</p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">⚠️</div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Unable to Load Game</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      The game provider is unavailable or the embed URL is not accessible.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      className="gap-2"
                    >
                      <RotateCw className="w-4 h-4" />
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <iframe
              id={`game-player-iframe-${game.id}`}
              src={game.embed_url}
              title={game.name}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
            />
          </div>

          {/* Betting Panel */}
          <div className="w-80 flex flex-col gap-4">
            {/* Bet Selector */}
            <div className="flex-1">
              <BetSelector
                minBet={gameConfig.min_bet}
                maxBet={gameConfig.max_bet}
                currentBalance={scBalance}
                onBetSelect={handleBetSelect}
                isProcessing={isSpinning}
              />
            </div>

            {/* Game Info */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">Game Information</p>
                <div className="space-y-2 text-sm">
                  {game.type && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-white font-medium capitalize">{game.type}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Bet:</span>
                    <span className="text-white font-medium">{gameConfig.min_bet.toFixed(2)} SC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Bet:</span>
                    <span className="text-white font-medium">{gameConfig.max_bet.toFixed(2)} SC</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs text-slate-500">
                  ⚠️ Please play responsibly. Set betting limits and take regular breaks.
                </p>
              </div>
            </div>

            {/* Balance Warning */}
            {scBalance < gameConfig.min_bet && (
              <Alert className="bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-200 text-sm">
                  Insufficient balance to play. You need at least {gameConfig.min_bet.toFixed(2)} SC.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-3 bg-slate-800/50 text-xs text-slate-400">
          <p>
            Playing: <span className="text-white font-semibold">{game.name}</span> by <span className="text-cyan-400">{game.provider}</span> • Powered by CoinKrazy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamePlayerModal;
