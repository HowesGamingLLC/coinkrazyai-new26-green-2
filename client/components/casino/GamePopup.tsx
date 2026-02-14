import { useState, useEffect } from 'react';
import { CasinoGame, CASINO_MIN_BET, CASINO_MAX_BET } from '@/data/casinoGames';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Loader } from 'lucide-react';
import { casino } from '@/lib/api';
import { toast } from 'sonner';

interface GamePopupProps {
  game: CasinoGame;
  onClose: () => void;
}

type PopupState = 'setup' | 'playing' | 'outOfFunds';

export function GamePopup({ game, onClose }: GamePopupProps) {
  const { user, refreshProfile } = useAuth();
  const [popupState, setPopupState] = useState<PopupState>('setup');
  const [betAmount, setBetAmount] = useState(CASINO_MIN_BET);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(Number(user?.sc_balance ?? 0));

  // Update balance when user changes
  useEffect(() => {
    if (user) {
      setCurrentBalance(Number(user.sc_balance ?? 0));
    }
  }, [user]);

  if (!user) return null;

  const hasEnoughBalance = currentBalance >= betAmount;

  const handlePlayGame = async () => {
    if (!hasEnoughBalance) {
      toast.error(`Insufficient SC balance. You need ${betAmount.toFixed(2)} SC to play.`);
      return;
    }

    setIsProcessing(true);

    // Deduct bet from balance immediately
    const newBalance = currentBalance - betAmount;
    setCurrentBalance(newBalance);
    setPopupState('playing');

    // Process transaction in background
    try {
      const response = await casino.playGame(game.id, betAmount);
      console.log('[Casino] Game transaction successful:', response);
      
      // If game returns winnings, add them
      if (response.winnings && response.winnings > 0) {
        const winningBalance = newBalance + response.winnings;
        setCurrentBalance(winningBalance);
        toast.success(`You won ${response.winnings.toFixed(2)} SC!`);
      } else {
        toast.error(`Better luck next time!`);
      }

      // Refresh user profile to sync with server
      await refreshProfile();
    } catch (err: any) {
      console.error('[Casino] Game transaction failed:', err);
      // Restore balance on error
      setCurrentBalance(currentBalance);
      toast.error('Failed to process game transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAgain = () => {
    if (currentBalance < CASINO_MIN_BET) {
      setPopupState('outOfFunds');
    } else {
      setPopupState('setup');
    }
  };

  const handleNavigateToCoinStore = () => {
    onClose();
    // Navigate to coin store
    window.location.href = '/store';
  };

  if (popupState === 'setup') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-2xl shadow-2xl border border-amber-500/30">
          {/* Coinkrazy Branded Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white">🎰 COINKRAZY</div>
              <div className="text-sm text-amber-100">Premium Casino</div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Game Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">{game.name}</h2>
              <p className="text-sm text-gray-400">{game.provider}</p>
            </div>

            {/* Game Preview */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={game.thumbnail}
                alt={game.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Wallet Info */}
            <div className="bg-gray-800 rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Your SC Balance</p>
                  <p className="text-3xl font-bold text-amber-400">{currentBalance.toFixed(2)} SC</p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </div>

            {/* Bet Amount Selector */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-300">Spin Amount</p>
                <p className="text-2xl font-bold text-amber-400">{betAmount.toFixed(2)} SC</p>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={CASINO_MIN_BET}
                  max={CASINO_MAX_BET}
                  step={0.01}
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  disabled={isProcessing}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{CASINO_MIN_BET.toFixed(2)} SC</span>
                  <span>{CASINO_MAX_BET.toFixed(2)} SC</span>
                </div>
              </div>

              {/* Quick Bet Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[0.01, 0.50, 2.50, 5.00].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={isProcessing}
                    className="px-2 py-2 bg-gray-700 hover:bg-amber-500 hover:text-white rounded font-semibold text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {amount.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Balance Check Message */}
            {!hasEnoughBalance && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400 font-semibold">Insufficient Balance</p>
                  <p className="text-sm text-red-300 mt-1">
                    You need {(betAmount - currentBalance).toFixed(2)} more SC to spin
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePlayGame}
                disabled={!hasEnoughBalance || isProcessing}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? 'Spinning...' : `SPIN NOW (${betAmount.toFixed(2)} SC)`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (popupState === 'playing') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-amber-500/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-white">🎰 COINKRAZY</div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Game Area */}
          <div className="flex-1 bg-black flex items-center justify-center min-h-[500px]">
            <div className="text-center space-y-4">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent"></div>
              </div>
              <p className="text-gray-400 text-lg">Game Loading...</p>
              <p className="text-amber-400 font-semibold text-xl">{game.name}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Spinning with: {betAmount.toFixed(2)} SC</p>
                <p>Your balance: {currentBalance.toFixed(2)} SC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (popupState === 'outOfFunds') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-md shadow-2xl border border-red-500/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 rounded-t-xl">
            <div className="text-2xl font-bold text-white">⚠️ Out of Funds</div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 text-center">
            <div className="text-6xl">💸</div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Looks like you need to re-up!</h2>
              <p className="text-gray-400">
                Your SC balance is too low to continue playing. Visit our Coin Store to purchase more Sweeps Coins.
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-red-400 font-semibold text-lg">Current Balance: {currentBalance.toFixed(2)} SC</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleNavigateToCoinStore}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
              >
                Visit Coin Store
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
