import { useState } from 'react';
import { casinoGames } from '@/data/casinoGames';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Loader } from 'lucide-react';
import { wallet } from '@/lib/api';

interface GamePlayerModalProps {
  gameId: string;
  onClose: () => void;
}

export function GamePlayerModal({ gameId, onClose }: GamePlayerModalProps) {
  const game = casinoGames.find((g) => g.id === gameId);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  if (!game || !user) return null;

  const currentScBalance = Number(user.sc_balance ?? 0);
  const hasEnoughBalance = currentScBalance >= game.costPerPlay;

  const handlePlayGame = async () => {
    if (!hasEnoughBalance) {
      setError(`Insufficient SC balance. You need ${game.costPerPlay} SC to play.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Deduct SC from wallet
      const response = await wallet.updateBalance(0, -game.costPerPlay);
      
      if (response.success) {
        setHasStarted(true);
      } else {
        setError('Failed to deduct SC. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{game.name}</h2>
            <p className="text-sm text-gray-400">{game.provider}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {!hasStarted ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 min-h-[400px]">
              {/* Game Preview */}
              <div className="w-full max-w-md">
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Game Info */}
              <div className="space-y-4 w-full max-w-md">
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-400">Cost per play</p>
                  <p className="text-2xl font-bold text-amber-400">{game.costPerPlay} SC</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-400">Your balance</p>
                  <p className="text-2xl font-bold text-white">{currentScBalance} SC</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Info Message */}
                {!hasEnoughBalance && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <p className="text-sm text-blue-400">
                      You need {game.costPerPlay - currentScBalance} more SC to play this game.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 w-full max-w-md">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePlayGame}
                  disabled={!hasEnoughBalance || isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Starting...' : 'Play Now'}
                </Button>
              </div>
            </div>
          ) : (
            /* Game Iframe */
            <div className="w-full h-full min-h-[600px] bg-black flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
                </div>
                <p className="text-gray-400">Loading game...</p>
                <p className="text-sm text-gray-500">
                  SC has been deducted from your balance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
