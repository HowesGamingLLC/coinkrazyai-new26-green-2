import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminGamesSports = () => {
  const [games, setGames] = useState([]);
  const [pokerTables, setPokerTables] = useState([]);
  const [bingoGames, setBingoGames] = useState([]);
  const [sportsEvents, setSportsEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [gamesRes, pokerRes, bingoRes, sportsRes] = await Promise.all([
          adminV2.games.list().catch(() => ({ data: [] })),
          adminV2.poker.listTables().catch(() => ({ data: [] })),
          adminV2.bingo.listGames().catch(() => ({ data: [] })),
          adminV2.sportsbook.listEvents().catch(() => ({ data: [] }))
        ]);
        setGames(gamesRes.data || gamesRes || []);
        setPokerTables(pokerRes.data || pokerRes || []);
        setBingoGames(bingoRes.data || bingoRes || []);
        setSportsEvents(sportsRes.data || sportsRes || []);
      } catch (error) {
        console.error('Failed to fetch games/sports data:', error);
        toast.error('Failed to load games');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="poker">Poker</TabsTrigger>
          <TabsTrigger value="bingo">Bingo</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="ingestion">Ingestion</TabsTrigger>
        </TabsList>

        {/* Games Management */}
        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Library</CardTitle>
              <CardDescription>Manage casino games and configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Add New Game</Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : games.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-2">Game Name</th>
                        <th className="text-left py-2 px-2">Category</th>
                        <th className="text-left py-2 px-2">RTP</th>
                        <th className="text-left py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map((game: any) => (
                        <tr key={game.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 font-semibold">{game.name}</td>
                          <td className="py-3 px-2">{game.category}</td>
                          <td className="py-3 px-2 font-mono">{game.rtp}%</td>
                          <td className="py-3 px-2">
                            <Badge variant={game.enabled ? 'default' : 'secondary'}>
                              {game.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="outline">RTP</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No games found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Poker Management */}
        <TabsContent value="poker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Poker Tables</CardTitle>
              <CardDescription>Manage poker tables and stakes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create New Table</Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : pokerTables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pokerTables.map((table: any) => (
                    <div key={table.id} className="p-4 border rounded-lg">
                      <p className="font-semibold">{table.name}</p>
                      <p className="text-sm text-muted-foreground">{table.stakes}</p>
                      <div className="mt-2 space-y-1 text-xs">
                        <p><span className="text-muted-foreground">Max Players:</span> {table.max_players}</p>
                        <p><span className="text-muted-foreground">Current:</span> {table.current_players || 0}</p>
                        <p><span className="text-muted-foreground">Buy-in:</span> ${table.buy_in_min} - ${table.buy_in_max}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Stats</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No poker tables found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bingo Management */}
        <TabsContent value="bingo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bingo Games</CardTitle>
              <CardDescription>Manage bingo rooms and patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create New Game</Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : bingoGames.length > 0 ? (
                <div className="space-y-3">
                  {bingoGames.map((game: any) => (
                    <div key={game.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{game.name}</p>
                        <p className="text-sm text-muted-foreground">Pattern: {game.pattern}</p>
                        <p className="text-xs text-muted-foreground">Jackpot: ${game.jackpot}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Caller</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No bingo games found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sports Management */}
        <TabsContent value="sports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sportsbook Events</CardTitle>
              <CardDescription>Manage sports events and odds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="mb-4">+ Create New Event</Button>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : sportsEvents.length > 0 ? (
                <div className="space-y-3">
                  {sportsEvents.map((event: any) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{event.event_name}</p>
                        <Badge variant={event.status === 'Live' ? 'destructive' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.sport}</p>
                      <p className="text-xs text-muted-foreground">Total Bets: {event.total_bets || 0}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Edit Odds</Button>
                        <Button size="sm" variant="outline">Settle</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No sports events found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Ingestion */}
        <TabsContent value="ingestion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Data Ingestion</CardTitle>
              <CardDescription>Import games from external providers and AI builders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">External Provider</h4>
                  <div className="space-y-2">
                    <select className="w-full px-3 py-2 border rounded-md text-sm">
                      <option>Select Provider...</option>
                      <option>Provider 1</option>
                      <option>Provider 2</option>
                    </select>
                    <Input placeholder="API Key" type="password" />
                    <Button className="w-full">Connect & Sync</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">AI Game Builder</h4>
                  <div className="space-y-2">
                    <Input placeholder="Game Name" />
                    <Input placeholder="Description" />
                    <Button className="w-full">Build with AI</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold">Ingestion Queue</p>
                <p className="text-xs text-muted-foreground">0 items pending</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGamesSports;
