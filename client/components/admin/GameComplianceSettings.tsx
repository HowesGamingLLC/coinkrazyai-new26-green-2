import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

interface GameConfig {
  game_id: number;
  game_name: string;
  max_win_amount: number;
  min_bet: number;
  max_bet: number;
  is_external: boolean;
  is_sweepstake: boolean;
  is_social_casino: boolean;
}

export const GameComplianceSettings: React.FC = () => {
  const [games, setGames] = useState<GameConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [editedMaxWin, setEditedMaxWin] = useState<{ [key: number]: string }>({});

  // Load all game configs
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setLoading(true);
        // Note: You'll need to add this endpoint or use existing game list
        // For now, we'll fetch all games with a simple request
        const response = await fetch('/api/admin/v2/games/configs');
        const data = await response.json();

        if (response.ok && data.success) {
          setGames(data.data);
          // Initialize edited max_win with current values
          const edited: { [key: number]: string } = {};
          data.data.forEach((game: GameConfig) => {
            edited[game.game_id] = game.max_win_amount.toString();
          });
          setEditedMaxWin(edited);
        } else {
          throw new Error(data.error || 'Failed to load');
        }
      } catch (err: any) {
        toast.error('Failed to load game configurations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, []);

  const handleMaxWinChange = (gameId: number, value: string) => {
    setEditedMaxWin(prev => ({
      ...prev,
      [gameId]: value
    }));
  };

  const handleSave = async (gameId: number) => {
    try {
      setSaving(gameId);
      const newMaxWin = parseFloat(editedMaxWin[gameId] || '20.00');

      if (isNaN(newMaxWin) || newMaxWin <= 0) {
        toast.error('Max win must be a positive number');
        return;
      }

      const response = await fetch(`/api/admin/v2/games/${gameId}/max-win`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ max_win_amount: newMaxWin })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setGames(prev => prev.map(game =>
          game.game_id === gameId
            ? { ...game, max_win_amount: newMaxWin }
            : game
        ));
        toast.success(`Updated max win to ${newMaxWin.toFixed(2)} SC`);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Compliance Settings</CardTitle>
          <CardDescription>
            Configure max win amounts and compliance settings for each game
          </CardDescription>
        </CardHeader>
      </Card>

      {games.length === 0 ? (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>No games found</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <Card key={game.game_id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  {/* Game Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Game Name</label>
                    <div className="font-semibold text-sm">{game.game_name}</div>
                  </div>

                  {/* Compliance Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <div className="text-xs space-y-1">
                      {game.is_external && (
                        <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          External
                        </div>
                      )}
                      {game.is_sweepstake && (
                        <div className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded ml-1">
                          Sweepstake
                        </div>
                      )}
                      {game.is_social_casino && (
                        <div className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded ml-1">
                          Social Casino
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bet Limits */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bet Limits</label>
                    <div className="text-xs">
                      {game.min_bet.toFixed(2)} - {game.max_bet.toFixed(2)} SC
                    </div>
                  </div>

                  {/* Current Max Win */}
                  <div className="space-y-2">
                    <label htmlFor={`max-win-${game.game_id}`} className="text-sm font-medium">
                      Max Win (SC)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id={`max-win-${game.game_id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={editedMaxWin[game.game_id] || ''}
                        onChange={(e) => handleMaxWinChange(game.game_id, e.target.value)}
                        className="flex-1"
                        disabled={saving === game.game_id}
                      />
                      <Button
                        onClick={() => handleSave(game.game_id)}
                        disabled={saving === game.game_id}
                        size="sm"
                      >
                        {saving === game.game_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
