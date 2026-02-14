import { useState, useMemo } from 'react';
import { casinoGames } from '@/data/casinoGames';
import { GameCard } from '@/components/casino/GameCard';
import { GamePlayerModal } from '@/components/casino/GamePlayerModal';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';

export default function Casino() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Separate Pragmatic games from others
  const pragmaticGames = useMemo(() =>
    casinoGames.filter(game => game.provider === 'Pragmatic'),
    []
  );

  const otherGames = useMemo(() =>
    casinoGames.filter(game => game.provider !== 'Pragmatic'),
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Casino Games</h1>
        <p className="text-gray-400">Play with Sweeps Coins (SC) for a chance to win</p>
      </div>

      {/* Pragmatic Play Featured Section */}
      {pragmaticGames.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Pragmatic Play Slots</h2>
              <p className="text-sm text-gray-400">Premium slot games powered by Pragmatic Play</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {pragmaticGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={(gameId) => setSelectedGame(gameId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Games Section */}
      {otherGames.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Other Casino Games</h2>
            <p className="text-sm text-gray-400">Explore our collection of other exciting games</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {otherGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={(gameId) => setSelectedGame(gameId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game Player Modal */}
      {selectedGame && (
        <GamePlayerModal
          gameId={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
