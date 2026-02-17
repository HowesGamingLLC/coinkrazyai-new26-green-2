import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalGamePlayer } from '@/components/external-games/ExternalGamePlayer';
import { apiCall } from '@/lib/api';

interface GameInfo {
  id: number;
  name: string;
  description: string;
  image_url: string;
  embed_url: string;
  slug: string;
  is_external: boolean;
  is_sweepstake: boolean;
  max_win_amount: number;
  min_bet: number;
  max_bet: number;
  currency: string;
}

const ExternalGames = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('game');
  
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load games
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const response = await apiCall<any>('/external-games');
        
        if (response.success) {
          setGames(response.data);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load games');
        toast.error('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  // If a specific game is selected, show the player
  if (gameId) {
    const selectedGame = games.find(g => g.id === parseInt(gameId));
    
    if (!selectedGame) {
      return (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => navigate('/external-games')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Game not found</AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate('/external-games')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Button>
        <ExternalGamePlayer gameId={selectedGame.id} />
      </div>
    );
  }

  // Show games list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sweepstake Games</h1>
        <p className="text-muted-foreground mt-2">
          Play our collection of sweepstake games and win real Sweeps Coins (SC)
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertDescription className="flex items-start gap-2">
          <span className="text-lg">✨</span>
          <div>
            <strong>How it works:</strong> Play with your Sweeps Coins (SC), win real SC. 
            Each game has a maximum win limit to ensure fair play. 
            Share your wins with friends to earn referral rewards!
          </div>
        </AlertDescription>
      </Alert>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Games Grid */}
      {!loading && games.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/external-games?game=${game.id}`)}>
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {game.is_sweepstake && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Sweepstake
                      </Badge>
                    )}
                    <Badge variant="outline">
                      Max Win: {game.max_win_amount.toFixed(2)} SC
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {game.image_url && (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={game.image_url}
                    alt={game.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <CardContent className="space-y-3">
                {game.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {game.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted p-2 rounded">
                    <div className="text-muted-foreground">Min Bet</div>
                    <div className="font-semibold">{game.min_bet.toFixed(2)} SC</div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="text-muted-foreground">Max Bet</div>
                    <div className="font-semibold">{game.max_bet.toFixed(2)} SC</div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/external-games?game=${game.id}`);
                  }}
                >
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && games.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Games Available</h3>
            <p className="text-muted-foreground">
              Check back soon for more sweepstake games!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExternalGames;
