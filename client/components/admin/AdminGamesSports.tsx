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
  const [games, setGames] = useState<any[]>([]);
  const [pokerTables, setPokerTables] = useState<any[]>([]);
  const [bingoGames, setBingoGames] = useState<any[]>([]);
  const [sportsEvents, setSportsEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [gamesRes, pokerRes, bingoRes, sportsRes] = await Promise.all([
        adminV2.games.list().catch(() => ({ data: [] })),
        adminV2.poker.listTables().catch(() => ({ data: [] })),
        adminV2.bingo.listGames().catch(() => ({ data: [] })),
        adminV2.sportsbook.listEvents().catch(() => ({ data: [] }))
      ]);
      setGames(Array.isArray(gamesRes) ? gamesRes : (gamesRes?.data || []));
      setPokerTables(Array.isArray(pokerRes) ? pokerRes : (pokerRes?.data || []));
      setBingoGames(Array.isArray(bingoRes) ? bingoRes : (bingoRes?.data || []));
      setSportsEvents(Array.isArray(sportsRes) ? sportsRes : (sportsRes?.data || []));
    } catch (error) {
      console.error('Failed to fetch games/sports data:', error);
      toast.error('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Game Library</CardTitle>
                <CardDescription>Manage casino games and configurations</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchData}>Refresh</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await adminV2.games.create({
                    name: formData.get('gameName'),
                    category: formData.get('category'),
                    rtp: formData.get('rtp'),
                  });
                  toast.success('Game added');
                  fetchData();
                  (e.target as HTMLFormElement).reset();
                } catch (error) {
                  toast.error('Failed to add game');
                }
              }} className="p-4 border rounded-lg bg-muted/30 grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Game Name</label>
                  <Input name="gameName" placeholder="e.g., Mega Slots" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select name="category" className="w-full px-3 py-2 border rounded-md text-sm" required>
                    <option>Slots</option>
                    <option>Poker</option>
                    <option>Bingo</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">RTP %</label>
                  <Input name="rtp" placeholder="95.5" type="number" step="0.1" required />
                </div>
                <Button type="submit">Add Game</Button>
              </form>

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
                              <Button size="sm" variant="outline" onClick={() => toast.info('Edit coming soon')}>Edit</Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                const newRtp = prompt('Enter new RTP:', String(game.rtp));
                                if (newRtp) {
                                  adminV2.games.update(game.id, { rtp: parseFloat(newRtp) })
                                    .then(() => { toast.success('Updated'); fetchData(); })
                                    .catch(() => toast.error('Failed'));
                                }
                              }}>RTP</Button>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Poker Tables</CardTitle>
                <CardDescription>Manage poker tables and stakes</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchData}>Refresh</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await adminV2.poker.createTable({
                    name: formData.get('tableName'),
                    stakes: formData.get('stakes'),
                    buyInMin: formData.get('buyInMin'),
                    buyInMax: formData.get('buyInMax'),
                  });
                  toast.success('Table created');
                  fetchData();
                  (e.target as HTMLFormElement).reset();
                } catch (error) {
                  toast.error('Failed to create table');
                }
              }} className="p-4 border rounded-lg bg-muted/30 grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Table Name</label>
                  <Input name="tableName" placeholder="e.g., Diamond Table" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Stakes</label>
                  <Input name="stakes" placeholder="e.g., $1/$2" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Min Buy-in</label>
                  <Input name="buyInMin" placeholder="20" type="number" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Max Buy-in</label>
                  <Input name="buyInMax" placeholder="200" type="number" required />
                </div>
                <Button type="submit" className="md:col-span-4">Create Table</Button>
              </form>

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
                        <p><span className="text-muted-foreground">Max Players:</span> {table.max_players || 8}</p>
                        <p><span className="text-muted-foreground">Current:</span> {table.current_players || 0}</p>
                        <p><span className="text-muted-foreground">Buy-in:</span> ${table.buy_in_min || 0} - ${table.buy_in_max || 0}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => toast.info('Stats coming soon')}>Stats</Button>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bingo Games</CardTitle>
                <CardDescription>Manage bingo rooms and patterns</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchData}>Refresh</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await adminV2.bingo.createGame({
                    name: formData.get('gameName'),
                    pattern: formData.get('pattern'),
                    jackpot: formData.get('jackpot'),
                  });
                  toast.success('Bingo game created');
                  fetchData();
                  (e.target as HTMLFormElement).reset();
                } catch (error) {
                  toast.error('Failed to create game');
                }
              }} className="p-4 border rounded-lg bg-muted/30 grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Game Name</label>
                  <Input name="gameName" placeholder="e.g., Morning Bonanza" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Pattern</label>
                  <select name="pattern" className="w-full px-3 py-2 border rounded-md text-sm" required>
                    <option>5-line</option>
                    <option>Full Card</option>
                    <option>Corner</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Jackpot</label>
                  <Input name="jackpot" placeholder="1000" type="number" required />
                </div>
                <Button type="submit">Create Game</Button>
              </form>

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
                        <p className="text-xs text-muted-foreground">Jackpot: ${game.jackpot || 0}</p>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sportsbook Events</CardTitle>
                <CardDescription>Manage sports events and odds</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchData}>Refresh</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await adminV2.sportsbook.createEvent({
                    sport: formData.get('sport'),
                    eventName: formData.get('eventName'),
                    status: formData.get('status'),
                  });
                  toast.success('Event created');
                  fetchData();
                  (e.target as HTMLFormElement).reset();
                } catch (error) {
                  toast.error('Failed to create event');
                }
              }} className="p-4 border rounded-lg bg-muted/30 grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Sport</label>
                  <select name="sport" className="w-full px-3 py-2 border rounded-md text-sm" required>
                    <option>NFL</option>
                    <option>NBA</option>
                    <option>Soccer</option>
                    <option>Tennis</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Event Name</label>
                  <Input name="eventName" placeholder="e.g., Team A vs Team B" required />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select name="status" className="w-full px-3 py-2 border rounded-md text-sm" required>
                    <option>Upcoming</option>
                    <option>Live</option>
                    <option>Closed</option>
                  </select>
                </div>
                <Button type="submit">Create Event</Button>
              </form>

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
                      <p className="text-xs text-muted-foreground">Total Bets: {(event.total_bets || 0).toLocaleString()}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => toast.info('Edit odds coming soon')}>Edit Odds</Button>
                        <Button size="sm" variant="outline" onClick={() => toast.info('Settle coming soon')}>Settle</Button>
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
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    try {
                      const gameId = prompt('Enter game ID to ingest:');
                      if (gameId) {
                        await adminV2.games.ingestData(parseInt(gameId), {
                          provider: formData.get('provider'),
                          apiKey: formData.get('apiKey'),
                        });
                        toast.success('Game ingested successfully');
                        fetchData();
                      }
                    } catch (error) {
                      toast.error('Failed to ingest game');
                    }
                  }} className="space-y-2">
                    <select name="provider" className="w-full px-3 py-2 border rounded-md text-sm">
                      <option>Select Provider...</option>
                      <option>Pragmatic Play</option>
                      <option>Microgaming</option>
                      <option>NetEnt</option>
                      <option>Other</option>
                    </select>
                    <Input name="apiKey" placeholder="API Key" type="password" required />
                    <Button className="w-full" type="submit">Connect & Sync</Button>
                  </form>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">AI Game Builder</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast.info('AI Game Builder - This feature creates games using AI. Coming soon!');
                  }} className="space-y-2">
                    <Input placeholder="Game Name" required />
                    <Input placeholder="Game Description" required />
                    <Button className="w-full" type="submit">Build with AI</Button>
                  </form>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold">Ingestion Queue</p>
                <p className="text-xs text-muted-foreground">Monitoring for pending ingestions...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGamesSports;
