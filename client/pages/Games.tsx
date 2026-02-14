import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, TrendingUp, Search, Loader } from 'lucide-react';
import { GameInfo } from '@shared/api';
import { ApiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await ApiClient.getGames();
        if (res.success && res.data) {
          setGames(res.data);
        } else {
          toast({ title: 'Error', description: 'Failed to load games', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Failed to fetch games:', error);
        toast({ title: 'Error', description: 'Failed to load games', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'slots', label: 'Slots' },
    { id: 'poker', label: 'Poker' },
    { id: 'bingo', label: 'Bingo' },
    { id: 'sportsbook', label: 'Sports' }
  ];

  const filtered = games.filter(g => {
    const categoryMatch = selectedCategory === 'all' || (g.type && g.type.toLowerCase() === selectedCategory);
    const searchMatch = g.name && g.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const featured = games.slice(0, 4); // Display first 4 as featured

  const handlePlayGame = (game: GameInfo) => {
    const gameTypeMap: { [key: string]: string } = {
      'slots': '/slots',
      'poker': '/poker',
      'bingo': '/bingo',
      'sportsbook': '/sportsbook'
    };

    const route = gameTypeMap[game.type?.toLowerCase() || ''];
    if (route) {
      navigate(route);
    } else {
      toast({ title: 'Info', description: 'Game not available yet', variant: 'default' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black">Game Library</h1>
          <p className="text-muted-foreground mt-2">
            {games.length} games available • Play now and win big!
          </p>
        </div>

        {/* Featured Games */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            Featured Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((game) => (
              <Card
                key={game.id}
                className="border-primary/20 cursor-pointer hover:border-primary/50 transition-all hover:scale-105"
                onClick={() => handlePlayGame(game)}
              >
                <CardContent className="p-4">
                  <div className="text-5xl mb-3">
                    {game.type === 'slots' && '🎰'}
                    {game.type === 'poker' && '♠️'}
                    {game.type === 'bingo' && '🎲'}
                    {game.type === 'sportsbook' && '⚽'}
                  </div>
                  <h3 className="font-bold mb-1 text-sm">{game.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="text-xs bg-muted/50 border-none">
                      {game.type?.toUpperCase()}
                    </Badge>
                    {game.rtp && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-bold text-green-500">{game.rtp}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {game.active_users && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {game.active_users} playing now
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full h-8 text-xs font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayGame(game);
                    }}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-muted/50"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length > 0 ? (
            filtered.map((game) => (
              <Card
                key={game.id}
                className="border-border cursor-pointer hover:border-primary/30 transition-all hover:scale-105"
                onClick={() => handlePlayGame(game)}
              >
                <CardContent className="p-4">
                  <div className="text-4xl mb-3">
                    {game.type === 'slots' && '🎰'}
                    {game.type === 'poker' && '♠️'}
                    {game.type === 'bingo' && '🎲'}
                    {game.type === 'sportsbook' && '⚽'}
                  </div>
                  <h3 className="font-bold text-sm mb-1">{game.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="text-xs bg-muted/50 border-none">
                      {game.type?.toUpperCase()}
                    </Badge>
                    {game.rtp && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-bold text-green-500">{game.rtp}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    {game.description && (
                      <p className="line-clamp-2">{game.description}</p>
                    )}
                    {game.active_users && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {game.active_users} playing now
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full h-8 text-xs font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayGame(game);
                    }}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border/30 col-span-full">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-lg">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'No games found matching your search.'
                    : 'No games available.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
