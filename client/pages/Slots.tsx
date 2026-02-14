import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { slots, games } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { GameInfo } from '@shared/api';

const SYMBOLS_MAP: Record<string, string> = {
  'cherry': '🍒',
  'lemon': '🍋',
  'orange': '🍊',
  'plum': '🍇',
  'bell': '🔔',
  'diamond': '💎',
  'seven': '7️⃣',
};

const SYMBOLS = Object.values(SYMBOLS_MAP);
const WINNING_COMBINATIONS = {
  'three_of_a_kind': 10,
  'two_pair': 3,
  'single_pair': 1,
};

interface GameState {
  reels: [string, string, string];
  isSpinning: boolean;
  lastWinnings: number;
  totalWins: number;
  totalLosses: number;
  spins: number;
}

const Slots = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [gameList, setGameList] = useState<GameInfo[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [betAmount, setBetAmount] = useState(0.50); // SC currency
  const [gameState, setGameState] = useState<GameState>({
    reels: ['🎰', '🎰', '🎰'],
    isSpinning: false,
    lastWinnings: 0,
    totalWins: 0,
    totalLosses: 0,
    spins: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchGames = async () => {
      try {
        const response = await games.getGames();
        const slotGames = (response.data || []).filter(g => g.type === 'slots');
        setGameList(slotGames);
        if (slotGames.length > 0) {
          setSelectedGame(slotGames[0]);
        }
      } catch (error: any) {
        console.error('Failed to fetch games:', error);
        toast.error('Failed to load games');
      } finally {
        setIsLoadingGames(false);
      }
    };

    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const getWinAmount = (reels: [string, string, string]) => {
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      return betAmount * 10;
    } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
      return betAmount * 2;
    }
    return 0;
  };

  const handleSpin = async () => {
    if (gameState.isSpinning) return;
    if (!selectedGame) return;
    if ((user?.sc_balance || 0) < betAmount) {
      toast.error('Insufficient SC balance');
      return;
    }

    setGameState(prev => ({ ...prev, isSpinning: true, lastWinnings: 0 }));

    // Start local spinning animation
    const spinStartTime = Date.now();
    const minSpinDuration = 1500;

    const animationInterval = setInterval(() => {
      const randomReels: [string, string, string] = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ];
      setGameState(prev => ({ ...prev, reels: randomReels }));
    }, 50);

    try {
      // Call API to get real result
      const response = await slots.spin(selectedGame.id as number, betAmount);

      if (response.success) {
        const { reels: serverReels, winnings, result_type } = response.data;

        // Map server symbol IDs to emojis (using the middle row reels[1])
        const finalReels: [string, string, string] = [
          SYMBOLS_MAP[serverReels[1][0]] || '❓',
          SYMBOLS_MAP[serverReels[1][1]] || '❓',
          SYMBOLS_MAP[serverReels[1][2]] || '❓',
        ];

        // Ensure minimum spin duration for better UX
        const elapsed = Date.now() - spinStartTime;
        const remaining = Math.max(0, minSpinDuration - elapsed);

        setTimeout(() => {
          clearInterval(animationInterval);

          setGameState(prev => ({
            ...prev,
            reels: finalReels,
            isSpinning: false,
            lastWinnings: winnings,
            totalWins: prev.totalWins + winnings,
            totalLosses: prev.totalLosses + (winnings === 0 ? betAmount : 0),
            spins: prev.spins + 1,
          }));

          if (winnings > 0) {
            toast.success(`You won ${winnings.toFixed(2)} SC!`);
            if (!isMuted) playSound();
          } else {
            toast.info('No win this time. Try again!');
          }
        }, remaining);
      } else {
        clearInterval(animationInterval);
        setGameState(prev => ({ ...prev, isSpinning: false }));
        toast.error(response.error || 'Failed to spin');
      }
    } catch (error: any) {
      clearInterval(animationInterval);
      setGameState(prev => ({ ...prev, isSpinning: false }));
      console.error('Spin failed:', error);
      toast.error(error.message || 'Failed to connect to server');
    }
  };

  const playSound = () => {
    // Placeholder for sound effect
    console.log('Playing win sound');
  };

  const resetGame = () => {
    setGameState({
      reels: ['🎰', '🎰', '🎰'],
      isSpinning: false,
      lastWinnings: 0,
      totalWins: 0,
      totalLosses: 0,
      spins: 0,
    });
  };

  if (isLoadingGames) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">SLOTS</h1>
          <p className="text-muted-foreground">Spin to win with our AI-powered slot machines</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="rounded-full"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Selection Sidebar */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider">Available Games</h3>
          <div className="space-y-2">
            {gameList.map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedGame?.id === game.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <p className="font-semibold text-sm">{game.title || game.name}</p>
                <p className="text-xs text-muted-foreground">RTP: {game.rtp}%</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Game Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedGame && (
            <>
              {/* Game Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedGame.title || selectedGame.name}</CardTitle>
                  <CardDescription>
                    RTP: {selectedGame.rtp}% | Volatility: {selectedGame.volatility || 'Medium'}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Slot Machine */}
              <Card className="bg-gradient-to-b from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-8">
                  <div className="space-y-6">
                    {/* Reels */}
                    <div className="flex items-center justify-center gap-4">
                      {gameState.reels.map((symbol, i) => (
                        <div
                          key={i}
                          className={`w-24 h-24 md:w-32 md:h-32 flex items-center justify-center text-5xl md:text-6xl border-4 border-primary rounded-lg bg-muted/80 transition-transform ${
                            gameState.isSpinning ? 'animate-bounce' : ''
                          }`}
                        >
                          {symbol}
                        </div>
                      ))}
                    </div>

                    {/* Last Result */}
                    {gameState.lastWinnings > 0 && (
                      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Last Win</p>
                        <p className="text-3xl font-black text-green-600">+{gameState.lastWinnings.toFixed(2)} SC</p>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold block mb-2">Bet Amount (SC)</label>
                        <div className="flex gap-2">
                          {[0.01, 0.25, 0.50, 1.00, 2.50, 5.00].map(amount => (
                            <Button
                              key={amount}
                              variant={betAmount === amount ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setBetAmount(amount)}
                              disabled={gameState.isSpinning || (user?.sc_balance || 0) < amount}
                            >
                              {amount.toFixed(2)}
                            </Button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max={Math.min(5.00, user?.sc_balance || 0)}
                          step="0.01"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Number(e.target.value))}
                          disabled={gameState.isSpinning}
                          className="w-full mt-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>SC {betAmount.toFixed(2)}</span>
                          <span>Balance: {Number(user?.sc_balance ?? 0).toFixed(2)} SC</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleSpin}
                        disabled={gameState.isSpinning || (user?.sc_balance || 0) < betAmount}
                        size="lg"
                        className="w-full font-bold text-lg"
                      >
                        {gameState.isSpinning ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Spinning...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            SPIN NOW
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Game
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Spins</p>
                      <p className="text-2xl font-bold">{gameState.spins}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Wins</p>
                      <p className="text-2xl font-bold text-green-600">{gameState.totalWins.toFixed(2)} SC</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Losses</p>
                      <p className="text-2xl font-bold text-red-600">{gameState.totalLosses.toFixed(2)} SC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Slots;
