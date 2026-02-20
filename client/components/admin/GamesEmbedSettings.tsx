import React, { useState, useEffect } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Code,
  Settings,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ALL_SLOT_GAMES } from '@shared/slotGamesDatabase';

interface GameRecord {
  id: number;
  name: string;
  provider: string;
  category: string;
  rtp: number;
  volatility: string;
  image_url?: string;
  embed_url?: string;
  enabled: boolean;
}

export const GamesEmbedSettings = () => {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [editingGame, setEditingGame] = useState<GameRecord | null>(null);
  const [jsonData, setJsonData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Fetch games on mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Filter games when search or provider filter changes
  useEffect(() => {
    applyFilters();
  }, [games, searchTerm, selectedProvider]);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const response = await adminV2.games.list();
      const gamesData = Array.isArray(response) ? response : response.data || [];
      setGames(gamesData);
      toast.success(`Loaded ${gamesData.length} games`);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      toast.error('Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = games;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        game =>
          game.name.toLowerCase().includes(lowerSearch) ||
          game.provider.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedProvider) {
      result = result.filter(game => game.provider === selectedProvider);
    }

    setFilteredGames(result);
  };

  const handleBulkImport = async () => {
    if (!jsonData.trim()) {
      toast.error('Please paste JSON data');
      return;
    }

    try {
      setIsImporting(true);
      const gamesData = JSON.parse(jsonData);
      const gamesToImport = Array.isArray(gamesData) ? gamesData : [gamesData];

      const result = await adminV2.aggregation.bulkImport(gamesToImport);
      toast.success(result.message || `Imported ${result.data?.imported || 0} games`);
      setJsonData('');
      setShowBulkImportDialog(false);
      fetchGames();
    } catch (error) {
      toast.error('Failed to import games: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromDatabase = async () => {
    try {
      setIsImporting(true);
      // Convert database games to import format
      const gamesToImport = ALL_SLOT_GAMES.map(game => ({
        name: game.name,
        description: game.description,
        category: game.category,
        provider: game.provider,
        rtp: game.rtp,
        volatility: game.volatility,
        image_url: game.image_url,
        embed_url: game.embed_url,
        enabled: game.enabled,
      }));

      const result = await adminV2.aggregation.bulkImport(gamesToImport);
      toast.success(`Imported ${result.data?.imported || 0} new games, updated ${result.data?.updated || 0}`);
      setShowImportDialog(false);
      fetchGames();
    } catch (error) {
      toast.error('Failed to import games: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleToggleGame = async (gameId: number, enabled: boolean) => {
    try {
      await adminV2.games.update(gameId, { enabled: !enabled });
      setGames(games.map(g => g.id === gameId ? { ...g, enabled: !g.enabled } : g));
      toast.success(`Game ${!enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update game');
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      await adminV2.games.delete(gameId);
      setGames(games.filter(g => g.id !== gameId));
      toast.success('Game deleted');
    } catch (error) {
      toast.error('Failed to delete game');
    }
  };

  const handleExportGames = async () => {
    try {
      const data = await adminV2.aggregation.exportGames();

      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
      );
      element.setAttribute('download', `games-export-${new Date().toISOString().split('T')[0]}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success('Games exported successfully');
    } catch (error) {
      toast.error('Failed to export games');
    }
  };

  const providers = [...new Set(games.map(g => g.provider).filter(Boolean))].sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Games Embed Settings</h1>
        <p className="text-muted-foreground">
          Manage game imports, embeddings, and display settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Games</p>
              <p className="text-2xl font-bold">{games.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Enabled</p>
              <p className="text-2xl font-bold">{games.filter(g => g.enabled).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Providers</p>
              <p className="text-2xl font-bold">{providers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg RTP</p>
              <p className="text-2xl font-bold">
                {games.length > 0
                  ? (games.reduce((sum, g) => sum + (g.rtp || 0), 0) / games.length).toFixed(1)
                  : 'N/A'}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Import Database Games
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Slot Games Database</DialogTitle>
              <DialogDescription>
                Import {ALL_SLOT_GAMES.length} pre-configured slot games with embed URLs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800">
                  This will import {ALL_SLOT_GAMES.length} professionally configured slot games from multiple providers including Pragmatic Play, Play'n GO, ELK Studios, and more.
                </p>
              </div>
              <Button
                onClick={handleImportFromDatabase}
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  'Import All Games'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Code className="w-4 h-4" />
              Bulk Import (JSON)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Import Games (JSON)</DialogTitle>
              <DialogDescription>
                Paste JSON data to import multiple games with custom settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                className="w-full h-64 p-3 border rounded font-mono text-sm"
                placeholder={`[
  {
    "name": "Game Name",
    "provider": "Provider Name",
    "category": "Slots",
    "rtp": 96.5,
    "volatility": "Medium",
    "embed_url": "https://...",
    "image_url": "https://...",
    "enabled": true
  }
]`}
                value={jsonData}
                onChange={e => setJsonData(e.target.value)}
              />
              <Button
                onClick={handleBulkImport}
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  'Import'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="gap-2" onClick={handleExportGames}>
          <Download className="w-4 h-4" />
          Export
        </Button>

        <Button variant="outline" className="gap-2" onClick={fetchGames}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search games..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Select value={selectedProvider || 'all'} onValueChange={value => setSelectedProvider(value === 'all' ? null : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map(provider => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Games List */}
      <Card>
        <CardHeader>
          <CardTitle>Games ({filteredGames.length})</CardTitle>
          <CardDescription>
            Showing {filteredGames.length} of {games.length} games
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGames.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No games found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold">RTP</th>
                    <th className="text-left py-3 px-4 font-semibold">Volatility</th>
                    <th className="text-left py-3 px-4 font-semibold">Embed</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.map(game => (
                    <tr key={game.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{game.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{game.provider}</td>
                      <td className="py-3 px-4">{game.rtp}%</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{game.volatility}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {game.embed_url ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={game.enabled ? 'default' : 'secondary'}>
                          {game.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {game.embed_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(game.embed_url, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleGame(game.id, game.enabled)}
                          >
                            {game.enabled ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGame(game.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesEmbedSettings;
