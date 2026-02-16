import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Play } from 'lucide-react';

interface Game {
  id: number;
  name: string;
  provider: string;
  category: string;
  rtp?: number;
  volatility?: string;
  enabled: boolean;
  image_url?: string;
  description?: string;
  created_at?: string;
}

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    fetchGames();
  }, [filter]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      
      const data = await response.json();
      let gamesList = data.games || data || [];
      
      // Filter enabled games only
      gamesList = gamesList.filter((g: Game) => g.enabled !== false);

      // Extract unique providers
      const uniqueProviders = [...new Set(gamesList.map((g: Game) => g.provider))];
      setProviders(uniqueProviders.sort());

      // Apply filter
      if (filter !== 'all') {
        gamesList = gamesList.filter((g: Game) => g.provider === filter);
      }

      setGames(gamesList);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderImage = (provider: string) => {
    return `https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=300&fit=crop&q=80`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Slots': 'bg-purple-100 text-purple-800',
      'Table Games': 'bg-blue-100 text-blue-800',
      'Casino Games': 'bg-green-100 text-green-800',
      'Poker': 'bg-red-100 text-red-800',
      'Bingo': 'bg-yellow-100 text-yellow-800',
      'BlackJack': 'bg-indigo-100 text-indigo-800',
      'Roulette': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Game Library</h1>
          <p className="text-gray-600">Explore our collection of premium games</p>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-600">Filter by Provider:</span>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({games.length})
            </Button>
            {providers.map((provider) => (
              <Button
                key={provider}
                variant={filter === provider ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(provider)}
              >
                {provider}
              </Button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <Spinner className="w-8 h-8" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No games found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              >
                {/* Game Image */}
                <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                  <img
                    src={game.image_url || getPlaceholderImage(game.provider)}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <Button
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  </div>
                </div>

                {/* Game Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{game.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{game.provider}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getCategoryColor(game.category)}>
                      {game.category}
                    </Badge>
                    {game.rtp && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        RTP {game.rtp}%
                      </Badge>
                    )}
                    {game.volatility && (
                      <Badge variant="secondary">
                        {game.volatility}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {game.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {game.description}
                    </p>
                  )}

                  {/* Play Button */}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Play Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
