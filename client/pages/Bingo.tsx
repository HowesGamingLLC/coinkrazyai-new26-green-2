import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { bingo } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { BingoGame } from '@shared/api';

const Bingo = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<BingoGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchGames = async () => {
      try {
        const response = await bingo.getRooms();
        setGames(response.data || []);
      } catch (error: any) {
        console.error('Failed to fetch bingo games:', error);
        toast.error('Failed to load bingo games');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleBuyTicket = async (gameId: number) => {
    try {
      await bingo.buyTicket(gameId);
      toast.success('Ticket purchased!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase ticket');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">BINGO ROOMS</h1>
        <p className="text-muted-foreground">Join a room and play bingo for amazing jackpots</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map(game => (
          <Card key={game.id} className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{game.name}</CardTitle>
                  <CardDescription>Pattern: {game.pattern}</CardDescription>
                </div>
                <Badge variant="outline">{game.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Players
                  </span>
                  <span className="font-bold">{game.players}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ticket Price</span>
                  <span className="font-bold">${game.ticket_price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Jackpot
                  </span>
                  <span className="font-bold text-yellow-600">${game.jackpot.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => handleBuyTicket(game.id)}
                className="w-full"
              >
                Buy Ticket
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {games.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No bingo games available at the moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Bingo;
