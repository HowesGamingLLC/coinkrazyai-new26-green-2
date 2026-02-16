import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface GameImportData {
  provider: string;
  name: string;
  slug?: string;
  series?: string;
  family?: string | null;
  category: string;
  type?: string;
  thumbnail?: string | null;
  embed_url?: string;
  description?: string;
  rtp?: number;
  volatility?: string;
  image_url?: string;
  enabled?: boolean;
}

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    total: number;
    imported: number;
    skipped: number;
    errors?: Array<{ game: string; provider: string; error: string }>;
    importedGames?: Array<any>;
  };
}

const GameImportAdmin = () => {
  const [importMode, setImportMode] = useState<'single' | 'bulk'>('single');
  const [singleGame, setSingleGame] = useState<Partial<GameImportData>>({
    enabled: true,
    rtp: 96.0,
  });
  const [bulkJson, setBulkJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSingleGameChange = (field: keyof GameImportData, value: any) => {
    setSingleGame(prev => ({ ...prev, [field]: value }));
  };

  const importSingleGame = async () => {
    try {
      if (!singleGame.provider || !singleGame.name || !singleGame.category) {
        toast.error('Required fields: Provider, Name, Category');
        return;
      }

      setLoading(true);
      const response = await fetch('/api/admin/games/import/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleGame),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to import game');
        return;
      }

      setResult(data);
      setShowResult(true);
      toast.success(`Game "${singleGame.name}" imported successfully!`);
      setSingleGame({ enabled: true, rtp: 96.0 });
    } catch (error) {
      toast.error('Failed to import game');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const importBulkGames = async () => {
    try {
      if (!bulkJson.trim()) {
        toast.error('Please enter game data');
        return;
      }

      let games: GameImportData[];
      try {
        const parsed = JSON.parse(bulkJson);
        games = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        toast.error('Invalid JSON format');
        return;
      }

      if (games.length === 0) {
        toast.error('No games to import');
        return;
      }

      setLoading(true);
      const response = await fetch('/api/admin/games/import/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to import games');
        return;
      }

      setResult(data);
      setShowResult(true);
      toast.success(`Bulk import completed: ${data.data?.imported || 0} games added`);
      setBulkJson('');
    } catch (error) {
      toast.error('Failed to import games');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={importMode === 'single' ? 'default' : 'outline'}
          onClick={() => setImportMode('single')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Single Game
        </Button>
        <Button
          variant={importMode === 'bulk' ? 'default' : 'outline'}
          onClick={() => setImportMode('bulk')}
        >
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
      </div>

      {/* Single Game Import */}
      {importMode === 'single' && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Import Single Game</h3>
          
          <div className="space-y-4">
            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={singleGame.provider || ''}
                onChange={(e) => handleSingleGameChange('provider', e.target.value)}
                placeholder="e.g., Novomatic, Pragmatic Play"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={singleGame.name || ''}
                onChange={(e) => handleSingleGameChange('name', e.target.value)}
                placeholder="e.g., Lord of the Ocean"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={singleGame.category || ''}
                onChange={(e) => handleSingleGameChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                <option value="slot">Slot</option>
                <option value="table">Table Games</option>
                <option value="poker">Poker</option>
                <option value="bingo">Bingo</option>
                <option value="casino">Casino Games</option>
              </select>
            </div>

            {/* RTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RTP %
              </label>
              <input
                type="number"
                step="0.1"
                value={singleGame.rtp || 96.0}
                onChange={(e) => handleSingleGameChange('rtp', parseFloat(e.target.value))}
                placeholder="96.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Volatility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volatility
              </label>
              <select
                value={singleGame.volatility || ''}
                onChange={(e) => handleSingleGameChange('volatility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select volatility...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={singleGame.image_url || ''}
                onChange={(e) => handleSingleGameChange('image_url', e.target.value)}
                placeholder="https://example.com/game.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={singleGame.description || ''}
                onChange={(e) => handleSingleGameChange('description', e.target.value)}
                placeholder="Game description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Enabled */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={singleGame.enabled !== false}
                onChange={(e) => handleSingleGameChange('enabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Enabled</label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={importSingleGame}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Importing...' : 'Import Game'}
            </Button>
          </div>
        </Card>
      )}

      {/* Bulk Import */}
      {importMode === 'bulk' && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Bulk Import Games</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Games JSON
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Paste an array of game objects or a single game object:
              </p>
              <textarea
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder={`[
  {
    "provider": "Novomatic",
    "name": "Lord of the Ocean",
    "category": "slot",
    "rtp": 96.0,
    "volatility": "medium",
    "image_url": "https://...",
    "enabled": true
  }
]`}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={importBulkGames}
              disabled={loading || !bulkJson.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Importing...' : 'Import Games'}
            </Button>
          </div>
        </Card>
      )}

      {/* Result */}
      {showResult && result && (
        <Card className={`p-6 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            )}
            
            <div className="flex-1">
              <h4 className="font-bold mb-2">
                {result.success ? 'Import Successful' : 'Import Failed'}
              </h4>
              <p className="text-sm mb-3">{result.message}</p>

              {result.data && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-mono">{result.data.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Imported:</span>
                    <Badge className="bg-green-600">{result.data.imported}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Skipped:</span>
                    <Badge variant="secondary">{result.data.skipped}</Badge>
                  </div>
                  {result.data.errors && result.data.errors.length > 0 && (
                    <div className="mt-3 p-2 bg-red-100 rounded">
                      <p className="font-bold text-red-900 mb-2">Errors:</p>
                      <ul className="space-y-1">
                        {result.data.errors.slice(0, 5).map((error, idx) => (
                          <li key={idx} className="text-xs text-red-800">
                            {error.game} ({error.provider}): {error.error}
                          </li>
                        ))}
                        {result.data.errors.length > 5 && (
                          <li className="text-xs text-red-800">
                            ... and {result.data.errors.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResult(false)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GameImportAdmin;
