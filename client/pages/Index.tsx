import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Coins, TrendingUp, Users, Zap, MessageSquare, Loader2 } from 'lucide-react';
import { games as gamesApi } from '@/lib/api';
import { toast } from 'sonner';

interface Game {
  id: number;
  name: string;
  provider: string;
  slug?: string;
  series?: string;
  type?: string;
  category?: string;
  rtp?: number;
  volatility?: string;
  image_url?: string;
  thumbnail?: string;
  embed_url?: string;
  enabled?: boolean;
}

const Index = () => {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  // Fetch featured games from backend
  useEffect(() => {
    fetchFeaturedGames();
  }, []);

  const fetchFeaturedGames = async () => {
    try {
      setIsLoadingGames(true);
      const response = await gamesApi.getGames();
      const allGames = Array.isArray(response) ? response : (response?.data || []);
      const enabledGames = allGames.filter((g: Game) => g.enabled !== false);
      // Get first 4 games as featured
      setFeaturedGames(enabledGames.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch featured games:', error);
      setFeaturedGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  };

  // Prepare games data with additional properties
  const games = featuredGames.map((game) => ({
    ...game,
    icon: Gamepad2,
    players: Math.floor(Math.random() * 2000 + 500).toLocaleString(),
    badge: game.series || 'Featured',
    color: 'from-blue-600 to-blue-400',
    type: 'imported' as const,
  }));

  // Debug: Log featured games data
  console.log('[Index] Featured Games Loaded:', {
    count: games.length,
    games: games.map((g) => ({
      id: g.id,
      name: g.name,
      provider: g.provider,
    })),
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-muted p-8 md:p-12 border border-border">
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge variant="outline" className="text-primary border-primary/30 py-1 px-3">
            <Zap className="w-3 h-3 mr-1 fill-primary" />
            Social Casino Excellence
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            WELCOME TO <br />
            <span className="text-primary">COINKRAZY AI2</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            The world's first AI-managed social casino. Play with Gold Coins or compete for Sweeps Coins in our 100% fair, AI-monitored games.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild className="font-bold text-lg">
              <Link to="/slots">PLAY NOW</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-bold text-lg border-2">
              <Link to="/store">GET FREE SC</Link>
            </Button>
          </div>
        </div>

        {/* Background Decor */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-primary blur-[120px] rounded-full transform translate-x-1/2 -translate-y-1/2" />
        </div>
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Players', value: '4,521', icon: Users },
          { label: 'Jackpot Total', value: '52,140 SC', icon: Coins },
          { label: 'Games Live', value: featuredGames.length.toString(), icon: Gamepad2 },
          { label: 'AI Status', value: 'Optimized', icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Games Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">FEATURED GAMES</h2>
          <Button variant="link" className="text-primary" asChild>
            <Link to="/slots">View All Games</Link>
          </Button>
        </div>
        {isLoadingGames ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading featured games...</p>
            </div>
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(57,255,20,0.1)]"
              >
                <CardHeader className="p-0">
                  <div className="h-40 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 transition-transform group-hover:scale-105 duration-500 overflow-hidden">
                    <img
                      src={game.image_url || game.thumbnail}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%231e40af" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239CA3AF"%3EGame Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold line-clamp-1">{game.name}</CardTitle>
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none text-xs">
                      {game.badge}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground text-sm">{game.provider}</CardDescription>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-between items-center">
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    <Users className="w-3 h-3 mr-1" />
                    {game.players} online
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      console.log('[Index] Game Play Clicked:', {
                        gameId: game.id,
                        gameName: game.name,
                        provider: game.provider,
                        timestamp: new Date().toISOString(),
                      });
                      if (game.embed_url) {
                        window.open(game.embed_url, '_blank');
                      } else {
                        toast.info('Game embed URL not available');
                      }
                    }}
                  >
                    PLAY
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="text-5xl mb-4">🎰</div>
              <h3 className="text-lg font-semibold mb-2">Games Coming Soon</h3>
              <p className="text-muted-foreground mb-6">Games are being imported. Check back soon!</p>
              <Button onClick={fetchFeaturedGames} variant="outline">
                Refresh Games
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* AI Employment Notice */}
      <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
          <MessageSquare className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg">AI-Managed Integrity</h3>
          <p className="text-muted-foreground text-sm">
            CoinKrazyAI2 is monitored in real-time by LuckyAI and our suite of specialized AI employees. All gameplay,
            payouts, and chat are moderated for a safe and fair experience.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
