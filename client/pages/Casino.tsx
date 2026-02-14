import { useState } from 'react';
import { casinoGames } from '@/data/casinoGames';
import { GameCard } from '@/components/casino/GameCard';
import { GamePlayerModal } from '@/components/casino/GamePlayerModal';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';

export default function Casino() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Casino Games</h1>
        <p className="text-gray-400">Play with Sweeps Coins (SC) for a chance to win</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {casinoGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={(gameId) => setSelectedGame(gameId)}
          />
        ))}
      </div>

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
