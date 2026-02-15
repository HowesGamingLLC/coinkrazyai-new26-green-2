import { useState, useMemo, useEffect } from 'react';
import { casinoGames } from '@/data/casinoGames';
import { PRAGMATIC_GAMES } from '@/data/pragmaticGames';
import { NEW_SLOT_GAMES, UPCOMING_SLOT_GAMES } from '@/data/slotGames';
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

  // Combine all games - only include games with explicit game URLs
  const allGames = useMemo(() => {
    // Convert slot games to casino game format
    // Only include games with explicit gameUrl property
    const slotGamesConverted = NEW_SLOT_GAMES
      .filter(g => g.gameUrl) // Only games with explicit URLs
      .map(g => ({
        id: g.id,
        name: g.title,
        provider: g.provider,
        thumbnail: g.image,
        costPerPlay: 0.01,
        type: 'slots' as const,
        gameUrl: g.gameUrl,
      }));

    // Combine all games - exclude games without explicit gameUrl
    const combined = [
      ...slotGamesConverted,
      // Exclude Pragmatic games and casinoGames that don't have explicit gameUrl
      // as they may fall back to incorrect default URLs
    ];

    // Deduplicate by ID
    const seen = new Set<string>();
    const deduplicated: any[] = [];

    for (const game of combined) {
      if (!seen.has(game.id) && game.gameUrl) {
        // Only include games with explicit gameUrl
        seen.add(game.id);
        deduplicated.push(game);
      }
    }

    console.log('[Casino] Games Loaded:', {
      slotGamesWithUrlCount: slotGamesConverted.length,
      totalAfterDedup: deduplicated.length,
      providers: [...new Set(deduplicated.map(g => g.provider))],
      note: 'Only games with explicit gameUrl properties are displayed',
    });

    return deduplicated;
  }, []);

  // Separate by provider
  const groupedGames = useMemo(() => {
    const groups: Record<string, any[]> = {};

    allGames.forEach(game => {
      if (!groups[game.provider]) {
        groups[game.provider] = [];
      }
      groups[game.provider].push(game);
    });

    // Sort providers: Featured first, then alphabetically
    const featured = ['Pragmatic Play', 'ELK Studios', 'Red Tiger Gaming', 'Hacksaw Gaming'];
    const sortedProviders = [
      ...featured.filter(p => groups[p]),
      ...Object.keys(groups).filter(p => !featured.includes(p)).sort(),
    ];

    return sortedProviders.map(provider => ({
      provider,
      games: groups[provider],
    }));
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
        <p className="text-gray-400">Play with Sweeps Coins (SC) for a chance to win • Bet from 0.01 SC to 5.00 SC</p>
      </div>

      {/* Games by Provider */}
      {groupedGames.map(({ provider, games }) => (
        <div key={provider} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">{provider}</h2>
              <p className="text-sm text-gray-400">{games.length} games available</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={(gameId) => setSelectedGame(gameId)}
              />
            ))}
          </div>
        </div>
      ))}

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
