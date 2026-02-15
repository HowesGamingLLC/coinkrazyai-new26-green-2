import { useState, useMemo, useEffect } from 'react';
import { casinoGames } from '@/data/casinoGames';
import { PRAGMATIC_GAMES } from '@/data/pragmaticGames';
import { GameCard } from '@/components/casino/GameCard';
import { GamePopup } from '@/components/casino/GamePopup';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';

export default function Casino() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Combine all games (Pragmatic + Other casino games) and deduplicate by ID
  const allGames = useMemo(() => {
    const pragmaticCasted = PRAGMATIC_GAMES.map(g => ({
      ...g,
      costPerPlay: g.costPerPlay,
    }));

    // Combine and deduplicate by game ID
    const combined = [...pragmaticCasted, ...casinoGames];
    const seen = new Set<string>();
    const deduplicated: any[] = [];

    for (const game of combined) {
      if (!seen.has(game.id)) {
        seen.add(game.id);
        deduplicated.push(game);
      }
    }

    // Debug: Log game loading
    console.log('[Casino] Games Loaded:', {
      pragmaticCount: pragmaticCasted.length,
      casinoGamesCount: casinoGames.length,
      totalAfterDedup: deduplicated.length,
      providers: [...new Set(deduplicated.map(g => g.provider))],
    });

    return deduplicated;
  }, []);

  // Separate Pragmatic games from others
  const pragmaticGames = useMemo(() => {
    const games = allGames.filter(game => game.provider === 'Pragmatic');
    console.log('[Casino] Pragmatic Games Filtered:', {
      count: games.length,
      games: games.slice(0, 5).map(g => ({ id: g.id, name: g.name })),
    });
    return games;
  }, [allGames]);

  const otherGames = useMemo(() => {
    const games = allGames.filter(game => game.provider !== 'Pragmatic');
    const providerBreakdown: Record<string, number> = {};
    games.forEach(g => {
      providerBreakdown[g.provider] = (providerBreakdown[g.provider] || 0) + 1;
    });
    console.log('[Casino] Other Games Filtered:', {
      count: games.length,
      providerBreakdown,
    });
    return games;
  }, [allGames]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
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

      {/* Game Popup */}
      {selectedGame && (() => {
        const game = allGames.find(g => g.id === selectedGame);
        return game ? (
          <GamePopup
            game={game}
            onClose={() => setSelectedGame(null)}
          />
        ) : null;
      })()}
    </div>
  );
}
