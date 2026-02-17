import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, RefreshCw, Upload, Download, Trash2, Eye } from 'lucide-react';

interface Game {
  id: number;
  name: string;
  provider: string;
  rtp: number;
  volatility: string;
  enabled: boolean;
  game_rating: number;
  total_ratings: number;
}

interface ImportHistory {
  id: number;
  import_type: string;
  provider: string;
  games_imported: number;
  games_updated: number;
  games_failed: number;
  status: string;
  created_at: string;
  completed_at: string;
}

interface ProviderConfig {
  id: number;
  name: string;
  slug: string;
  is_enabled: boolean;
  last_sync_at?: string;
}

export const GameManagementDashboard: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterVolatility, setFilterVolatility] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);

  const [crawlUrl, setCrawlUrl] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);

  // Load games
  useEffect(() => {
    loadGames();
    loadProviders();
    loadImportHistory();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/v2/games');
      if (!response.ok) throw new Error('Failed to load games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      toast.error('Failed to load games');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/admin/v2/providers');
      if (!response.ok) throw new Error('Failed to load providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadImportHistory = async () => {
    try {
      const response = await fetch('/api/admin/v2/import-history?limit=10');
      if (!response.ok) throw new Error('Failed to load import history');
      const data = await response.json();
      setImportHistory(data.history);
    } catch (error) {
      console.error('Failed to load import history:', error);
    }
  };

  // Filter and sort games
  const filteredGames = games
    .filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvider = filterProvider === 'all' || game.provider === filterProvider;
      const matchesVolatility = filterVolatility === 'all' || game.volatility === filterVolatility;
      return matchesSearch && matchesProvider && matchesVolatility;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rtp') return b.rtp - a.rtp;
      if (sortBy === 'rating') return (b.game_rating || 0) - (a.game_rating || 0);
      return 0;
    });

  // Crawl URL
  const handleCrawlUrl = async () => {
    if (!crawlUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/v2/games/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: crawlUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to crawl URL');
        return;
      }

      toast.success(`Successfully imported: ${data.data?.name || 'Game'}`);
      setCrawlUrl('');
      loadGames();
    } catch (error) {
      toast.error('Error crawling URL');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sync provider
  const handleSyncProvider = async (providerId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/v2/providers/${providerId}/sync`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to sync provider');
        return;
      }

      toast.success(
        `Sync complete: ${data.data.imported} imported, ${data.data.updated} updated`
      );
      loadGames();
      loadImportHistory();
    } catch (error) {
      toast.error('Error syncing provider');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Test provider connection
  const handleTestConnection = async (providerId: number) => {
    try {
      const response = await fetch(`/api/admin/v2/providers/${providerId}/test`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error testing connection');
      console.error(error);
    }
  };

  // Delete game
  const handleDeleteGame = async (gameId: number) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const response = await fetch(`/api/admin/v2/games/${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete game');

      toast.success('Game deleted');
      loadGames();
    } catch (error) {
      toast.error('Error deleting game');
      console.error(error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games">Games Library</TabsTrigger>
          <TabsTrigger value="crawler">Web Crawler</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        {/* GAMES LIBRARY TAB */}
        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Library Management</CardTitle>
              <CardDescription>
                View, filter, and manage all games in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={filterProvider} onValueChange={setFilterProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {[...new Set(games.map((g) => g.provider).filter(Boolean))].map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterVolatility} onValueChange={setFilterVolatility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by volatility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Volatility</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="rtp">RTP (High to Low)</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Games Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Game Name</th>
                      <th className="px-4 py-2 text-left">Provider</th>
                      <th className="px-4 py-2 text-right">RTP</th>
                      <th className="px-4 py-2 text-left">Volatility</th>
                      <th className="px-4 py-2 text-left">Rating</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredGames.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          No games found
                        </td>
                      </tr>
                    ) : (
                      filteredGames.map((game) => (
                        <tr key={game.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{game.name}</td>
                          <td className="px-4 py-2">{game.provider}</td>
                          <td className="px-4 py-2 text-right font-semibold">
                            {game.rtp.toFixed(2)}%
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {game.volatility}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {game.game_rating > 0 ? (
                              <span className="text-yellow-500">
                                ★ {game.game_rating.toFixed(1)} ({game.total_ratings})
                              </span>
                            ) : (
                              <span className="text-gray-400">No ratings</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                game.enabled
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {game.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => console.log('View game:', game.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteGame(game.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Showing {filteredGames.length} of {games.length} games</span>
                <Button onClick={loadGames} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEB CRAWLER TAB */}
        <TabsContent value="crawler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Crawler</CardTitle>
              <CardDescription>
                Crawl and import games from external websites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium">Website URL</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/game-page"
                    value={crawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                  />
                  <Button onClick={handleCrawlUrl} disabled={loading || !crawlUrl}>
                    {loading ? 'Crawling...' : 'Crawl'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  The crawler will extract game information (name, RTP, volatility, description) from
                  the provided URL.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROVIDERS TAB */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Management</CardTitle>
              <CardDescription>
                Manage provider configurations and sync game catalogs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <Card key={provider.id} className="border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          Status:{' '}
                          <span
                            className={`font-semibold ${
                              provider.is_enabled
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {provider.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </p>
                        {provider.last_sync_at && (
                          <p className="text-gray-600">
                            Last Sync:{' '}
                            <span className="font-semibold">
                              {new Date(provider.last_sync_at).toLocaleDateString()}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestConnection(provider.id)}
                          className="text-xs"
                        >
                          Test Connection
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSyncProvider(provider.id)}
                          disabled={loading || !provider.is_enabled}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMPORT HISTORY TAB */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View all game import operations and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Provider</th>
                      <th className="px-4 py-2 text-right">Imported</th>
                      <th className="px-4 py-2 text-right">Updated</th>
                      <th className="px-4 py-2 text-right">Failed</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          No import history
                        </td>
                      </tr>
                    ) : (
                      importHistory.map((history) => (
                        <tr key={history.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">
                            {history.import_type === 'provider_api' ? 'Provider API' : 'Crawler'}
                          </td>
                          <td className="px-4 py-2">{history.provider || 'N/A'}</td>
                          <td className="px-4 py-2 text-right">{history.games_imported}</td>
                          <td className="px-4 py-2 text-right">{history.games_updated}</td>
                          <td className="px-4 py-2 text-right text-red-600">
                            {history.games_failed}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                history.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : history.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {history.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-600 text-xs">
                            {new Date(history.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
