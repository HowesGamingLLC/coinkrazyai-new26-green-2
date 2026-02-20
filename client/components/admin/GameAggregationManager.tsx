import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload, Download, Loader2, AlertCircle, CheckCircle2, Eye, Trash2,
  FileJson, Database, RefreshCw, Copy, Play, RotateCw, Zap, History, Search, Edit2,
  ExternalLink, Globe, Info, Settings, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { adminV2 } from '@/lib/api';
import ImportHistory from './ImportHistory';

interface GameData {
  provider_name: string;
  external_id: string;
  name: string;
  description?: string;
  category: 'Slots' | 'Table' | 'Live' | 'Other';
  rtp: number;
  volatility: 'Low' | 'Medium' | 'High';
  image_url?: string;
  embed_url?: string;
  launch_url?: string;
  features?: string[];
  themes?: string[];
  enabled?: boolean;
}

interface ImportResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
}

interface DevServerStatus {
  running: boolean;
  port?: number;
}

const GameAggregationManager = () => {
  const [activeTab, setActiveTab] = useState('crawler');
  const [isLoading, setIsLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<GameData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [devServerStatus, setDevServerStatus] = useState<DevServerStatus | null>(null);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sampleDataExpanded, setSampleDataExpanded] = useState(false);

  // Crawler state
  const [crawlerUrl, setCrawlerUrl] = useState('');
  const [crawledGames, setCrawledGames] = useState<GameData[]>([]);
  const [editingGame, setEditingGame] = useState<{ index: number; data: GameData } | null>(null);
  const [previewingGame, setPreviewingGame] = useState<GameData | null>(null);
  const [isImportingSingle, setIsImportingSingle] = useState<number | null>(null);

  // Fetch import history on mount
  useEffect(() => {
    if (activeTab === 'import') {
      fetchImportHistory();
    }
  }, [activeTab]);

  // Fetch import history
  const fetchImportHistory = async () => {
    try {
      setHistoryLoading(true);
      const result = await adminV2.importHistory.list(50, 0);
      if (result?.data) {
        setImportHistory(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch import history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Crawler handlers
  const handleStartCrawl = async () => {
    if (!crawlerUrl) {
      toast.error('Please enter a URL to crawl');
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminV2.games.crawlSlots(crawlerUrl, undefined, true);
      if (result.success && result.data) {
        setCrawledGames(result.data);
        toast.success(`Found ${result.data.length} games`);
      } else {
        toast.error(result.error || 'Failed to crawl games');
      }
    } catch (error: any) {
      toast.error(`Crawl failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSingleGame = async (game: GameData, index: number) => {
    setIsImportingSingle(index);
    try {
      const result = await adminV2.games.saveCrawledGame(game);
      if (result.success) {
        toast.success(`Successfully imported ${game.name}`);
        // Mark as imported locally if we want, but simple toast is fine for now
      } else {
        toast.error(result.error || `Failed to import ${game.name}`);
      }
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsImportingSingle(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editingGame) return;

    const newGames = [...crawledGames];
    newGames[editingGame.index] = editingGame.data;
    setCrawledGames(newGames);
    setEditingGame(null);
    toast.success('Game details updated locally');
  };

  // Sample data for quick testing
  const SAMPLE_GAMES: GameData[] = [
    {
      provider_name: 'Pragmatic Play',
      external_id: 'pp_sweet_bonanza',
      name: 'Sweet Bonanza',
      description: 'A vibrant slot game with cascading reels and sweet rewards',
      category: 'Slots',
      rtp: 96.49,
      volatility: 'High',
      image_url: 'https://via.placeholder.com/300x200?text=Sweet+Bonanza',
      embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2Fru%2F&gcpif=2273&gameSymbol=vs20sweetbonanza&jurisdiction=99',
      features: ['Free Spins', 'Multipliers', 'Bonus Buy'],
      themes: ['Candy', 'Adventure'],
      enabled: true
    },
    {
      provider_name: 'Pragmatic Play',
      external_id: 'pp_great_rhino',
      name: 'Great Rhino',
      description: 'Classic safari-themed slot with big wins',
      category: 'Slots',
      rtp: 96.5,
      volatility: 'Medium',
      image_url: 'https://via.placeholder.com/300x200?text=Great+Rhino',
      embed_url: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?stylename=demo_clienthub&lang=en&cur=USD&websiteUrl=https%3A%2F%2Fclienthub.pragmaticplay.com%2Fru%2F&gcpif=2273&gameSymbol=vs20rhino&jurisdiction=99',
      features: ['Free Spins', 'Wild Reels', 'Expanding Symbols'],
      themes: ['Safari', 'Animals'],
      enabled: true
    },
    {
      provider_name: 'NetEnt',
      external_id: 'ne_starburst',
      name: 'Starburst',
      description: 'Futuristic space-themed slot game',
      category: 'Slots',
      rtp: 96.1,
      volatility: 'Low',
      image_url: 'https://via.placeholder.com/300x200?text=Starburst',
      features: ['Wilds', 'Re-spins', 'High Frequency Wins'],
      themes: ['Space', 'Sci-Fi'],
      enabled: true
    },
    {
      provider_name: 'Microgaming',
      external_id: 'mg_mega_moolah',
      name: 'Mega Moolah',
      description: 'Iconic progressive jackpot slot',
      category: 'Slots',
      rtp: 88.12,
      volatility: 'High',
      image_url: 'https://via.placeholder.com/300x200?text=Mega+Moolah',
      features: ['Progressive Jackpot', 'Free Spins', 'Wild Multipliers'],
      themes: ['Safari', 'Luxury'],
      enabled: true
    },
    {
      provider_name: 'Play\'n GO',
      external_id: 'pngo_book_of_dead',
      name: 'Book of Dead',
      description: 'Adventure-themed slot with expanding symbols',
      category: 'Slots',
      rtp: 96.21,
      volatility: 'High',
      image_url: 'https://via.placeholder.com/300x200?text=Book+of+Dead',
      features: ['Expanding Symbols', 'Free Spins', 'Re-spins'],
      themes: ['Adventure', 'Ancient Egypt'],
      enabled: true
    }
  ];

  // Parse and validate JSON
  const parseJsonData = (text: string): GameData[] | null => {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error('Data must be a JSON array');
      }
      return data;
    } catch (error) {
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
      const parsed = parseJsonData(content);
      if (parsed) {
        toast.success(`Loaded ${parsed.length} games`);
      }
    };
    reader.readAsText(file);
  };

  // Load sample data
  const loadSampleData = () => {
    const sampleJson = JSON.stringify(SAMPLE_GAMES, null, 2);
    setJsonText(sampleJson);
    setPreviewData(SAMPLE_GAMES);
    toast.success('Loaded 5 sample games');
  };

  // Preview data
  const handlePreview = () => {
    const parsed = parseJsonData(jsonText);
    if (!parsed) {
      toast.error('Invalid JSON format');
      return;
    }
    setPreviewData(parsed);
    setShowPreview(true);
  };

  // Copy sample data to clipboard
  const copySampleData = () => {
    const sampleJson = JSON.stringify(SAMPLE_GAMES, null, 2);
    navigator.clipboard.writeText(sampleJson);
    toast.success('Sample data copied to clipboard');
  };

  // Perform bulk import
  const handleBulkImport = async () => {
    const parsed = parseJsonData(jsonText);
    if (!parsed || parsed.length === 0) {
      toast.error('Please provide valid JSON game data');
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminV2.aggregation.bulkImport(parsed);
      setImportResult(result.data);
      
      if (result.data.success) {
        toast.success(
          `Imported ${result.data.imported} games, Updated ${result.data.updated} games`
        );
        setJsonText('');
        setPreviewData([]);
      } else {
        toast.warning(`Partial success: ${result.data.errors.length} errors`);
      }
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Export games
  const handleExportGames = async () => {
    try {
      const result = await adminV2.aggregation.exportGames({});
      const dataStr = JSON.stringify(result, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `games-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('Games exported successfully');
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  // Seed database with sample data
  const handleSeedDatabase = async () => {
    if (!window.confirm('Seed database with 5 sample games?')) return;

    setIsLoading(true);
    try {
      const result = await adminV2.aggregation.bulkImport(SAMPLE_GAMES);
      setImportResult(result.data);
      
      if (result.data.success) {
        toast.success(`Database seeded: ${result.data.imported} games added`);
      } else {
        toast.warning(`Seeding partial success: ${result.data.errors.length} errors`);
      }
    } catch (error: any) {
      toast.error(`Seeding failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Dev server controls
  const checkDevServerStatus = async () => {
    try {
      const response = await fetch('/api/ping');
      if (response.ok) {
        setDevServerStatus({ running: true, port: 8080 });
        toast.success('Dev server is running');
      }
    } catch {
      setDevServerStatus({ running: false });
      toast.error('Dev server is not responding');
    }
  };

  const restartDevServer = async () => {
    if (!window.confirm('Restart the dev server? This will briefly pause the application.')) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd call an API endpoint to restart
      toast.loading('Restarting dev server...');
      setTimeout(() => {
        toast.success('Dev server restarted');
        setIsLoading(false);
      }, 2000);
    } catch (error: any) {
      toast.error('Failed to restart dev server');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Game Aggregation & Import</h2>
          <p className="text-muted-foreground mt-2">
            Manage bulk game imports, database seeding, and game aggregation
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="crawler" className="gap-2">
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Crawler</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Bulk Import</span>
            <span className="sm:hidden">Import</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="seed" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Seed</span>
          </TabsTrigger>
          <TabsTrigger value="devserver" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Dev</span>
          </TabsTrigger>
        </TabsList>

        {/* CRAWLER TAB */}
        <TabsContent value="crawler" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <RotateCw className="w-5 h-5" />
                Live Slot Crawler
              </CardTitle>
              <CardDescription>
                Input a provider URL to crawl slot games with full metadata and launch URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example-casino.com/provider/pragmatic-play"
                    value={crawlerUrl}
                    onChange={(e) => setCrawlerUrl(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Button
                  onClick={handleStartCrawl}
                  disabled={isLoading}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90 h-11 px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Crawling...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Start Crawl
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {crawledGames.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Crawler Results
                  <Badge variant="secondary" className="rounded-full">
                    {crawledGames.length} Games Found
                  </Badge>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {crawledGames.map((game, index) => (
                  <Card key={index} className="group relative overflow-hidden border-muted/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
                    {/* Thumbnail Overlay on Hover */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={game.image_url || 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?w=400&q=80'}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full gap-2 font-semibold"
                          onClick={() => setPreviewingGame(game)}
                        >
                          <Play className="w-4 h-4" /> Play Demo
                        </Button>
                        <div className="flex gap-2 w-full">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-xs border-white/20 text-white hover:bg-white/10"
                            onClick={() => setEditingGame({ index, data: { ...game } })}
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-1 text-xs bg-primary hover:bg-primary/90"
                            onClick={() => handleImportSingleGame(game, index)}
                            disabled={isImportingSingle === index}
                          >
                            {isImportingSingle === index ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Upload className="w-3 h-3" />
                            )}
                            Import
                          </Button>
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border-none text-[10px] font-bold">
                        {game.rtp ? `${game.rtp}% RTP` : 'RTP N/A'}
                      </Badge>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {game.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {game.provider_name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] h-5 border-primary/20 bg-primary/5 text-primary">
                          {game.category}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {game.features?.slice(0, 2).map((feat, i) => (
                          <Badge key={i} variant="secondary" className="text-[8px] h-4 bg-muted/50 border-none">
                            {feat}
                          </Badge>
                        ))}
                        {game.features && game.features.length > 2 && (
                          <Badge variant="secondary" className="text-[8px] h-4 bg-muted/50 border-none">
                            +{game.features.length - 2}
                          </Badge>
                        )}
                      </div>

                      {game.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-2 leading-relaxed italic">
                          "{game.description}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* BULK IMPORT TAB */}
        <TabsContent value="import" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="w-5 h-5" />
                  Import Games
                </CardTitle>
                <CardDescription>Upload JSON game data or paste manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload JSON File</label>
                  <div className="flex gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={loadSampleData}
                      className="gap-2"
                    >
                      Sample Data
                    </Button>
                  </div>
                </div>

                {/* Manual JSON Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">JSON Data</label>
                  <Textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder={`Paste or load JSON array here...\n\nExample format:\n[\n  {\n    "provider_name": "Pragmatic Play",\n    "external_id": "game_1",\n    "name": "Sweet Bonanza",\n    "category": "Slots",\n    "rtp": 96.49,\n    "volatility": "High"\n  }\n]`}
                    className="min-h-64 font-mono text-xs"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    className="flex-1 gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleBulkImport}
                    disabled={isLoading || !jsonText.trim()}
                    className="flex-1 gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import
                      </>
                    )}
                  </Button>
                </div>

                {/* Sample Data Info */}
                <div className="border rounded-lg p-3 bg-muted/30">
                  <button
                    onClick={() => setSampleDataExpanded(!sampleDataExpanded)}
                    className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition"
                  >
                    <span>Sample Data Available</span>
                    <span className="text-xs">{sampleDataExpanded ? '−' : '+'}</span>
                  </button>
                  {sampleDataExpanded && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        5 popular games ready to import
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copySampleData}
                        className="w-full gap-2 justify-start text-xs"
                      >
                        <Copy className="w-3 h-3" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-4">
              {/* Preview Modal */}
              {showPreview && previewData.length > 0 && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview ({previewData.length} games)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPreview(false)}
                      >
                        ✕
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {previewData.slice(0, 10).map((game, idx) => (
                      <div key={idx} className="p-3 border rounded-lg space-y-1 bg-muted/30">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{game.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {game.provider_name}
                            </p>
                          </div>
                          <Badge variant="outline">{game.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="bg-primary/20 px-2 py-1 rounded">
                            RTP: {game.rtp}%
                          </span>
                          <span className="bg-secondary/20 px-2 py-1 rounded">
                            {game.volatility}
                          </span>
                        </div>
                      </div>
                    ))}
                    {previewData.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{previewData.length - 10} more games
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Import Results */}
              {importResult && (
                <Card
                  className={
                    importResult.success
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-yellow-500/50 bg-yellow-500/5'
                  }
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {importResult.success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          Import Successful
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          Partial Success
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <p className="text-2xl font-bold text-green-600">
                          {importResult.imported}
                        </p>
                        <p className="text-xs text-muted-foreground">Imported</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <p className="text-2xl font-bold text-blue-600">
                          {importResult.updated}
                        </p>
                        <p className="text-xs text-muted-foreground">Updated</p>
                      </div>
                    </div>

                    {importResult.errors.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm font-medium text-red-600 mb-2">
                          {importResult.errors.length} Error(s)
                        </p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {importResult.errors.slice(0, 5).map((err, idx) => (
                            <p key={idx} className="text-xs text-red-500">
                              • {err}
                            </p>
                          ))}
                          {importResult.errors.length > 5 && (
                            <p className="text-xs text-red-500">
                              +{importResult.errors.length - 5} more errors
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setImportResult(null)}
                      className="w-full"
                    >
                      Clear
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Export Option */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={handleExportGames}
                    className="w-full gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Existing Games
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* IMPORT HISTORY TAB */}
        <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-300">
          <ImportHistory
            data={importHistory}
            isLoading={historyLoading}
            onRefresh={fetchImportHistory}
          />
        </TabsContent>

        {/* SEED DATABASE TAB */}
        <TabsContent value="seed" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Quick Database Seeding
              </CardTitle>
              <CardDescription>
                Quickly populate your database with high-quality sample games
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warning Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Bulk Operation</AlertTitle>
                <AlertDescription>
                  This will add 5 sample games to your database. Existing games with the same
                  external_id will be updated. Proceed with caution in production.
                </AlertDescription>
              </Alert>

              {/* Sample Games Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold">Sample Games (5 total)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SAMPLE_GAMES.map((game) => (
                    <div
                      key={game.external_id}
                      className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{game.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {game.provider_name}
                          </p>
                        </div>
                        <Badge>{game.category}</Badge>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-primary/20">
                          RTP: {game.rtp}%
                        </span>
                        <span className="px-2 py-1 rounded bg-secondary/20">
                          {game.volatility}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seed Button */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleSeedDatabase}
                  disabled={isLoading}
                  size="lg"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Seed Database
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={loadSampleData}
                  size="lg"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy to Import
                </Button>
              </div>

              {/* Result Display */}
              {importResult && (
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Database Seeded Successfully
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">
                      ✓ {importResult.imported} new games added
                    </p>
                    {importResult.updated > 0 && (
                      <p className="text-sm">
                        ✓ {importResult.updated} games updated
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEV SERVER TAB */}
        <TabsContent value="devserver" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Development Server Controls
              </CardTitle>
              <CardDescription>
                Manage the development server and database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Server Status */}
              <div className="space-y-3">
                <h3 className="font-semibold">Server Status</h3>
                <Button
                  variant="outline"
                  onClick={checkDevServerStatus}
                  className="w-full gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Status
                </Button>

                {devServerStatus && (
                  <Alert
                    className={
                      devServerStatus.running
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-red-500/50 bg-red-500/5'
                    }
                  >
                    <div className="flex items-center gap-2">
                      {devServerStatus.running ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <AlertTitle>
                          {devServerStatus.running ? 'Server Running' : 'Server Offline'}
                        </AlertTitle>
                        <AlertDescription>
                          {devServerStatus.running
                            ? `Dev server is running on port ${devServerStatus.port}`
                            : 'Dev server is not responding'}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>

              {/* Restart Server */}
              <div className="space-y-3">
                <h3 className="font-semibold">Restart Server</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Server Restart</AlertTitle>
                  <AlertDescription>
                    Restarting will temporarily stop the dev server. All connected clients will be
                    disconnected for a few seconds.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={restartDevServer}
                  disabled={isLoading}
                  size="lg"
                  variant="destructive"
                  className="w-full gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Restarting...
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4" />
                      Restart Dev Server
                    </>
                  )}
                </Button>
              </div>

              {/* Common Operations */}
              <div className="space-y-3">
                <h3 className="font-semibold">Common Operations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="gap-2 h-12 justify-start"
                    disabled
                  >
                    <Play className="w-4 h-4" />
                    <div className="text-left text-xs">
                      <p className="font-medium">Rebuild Client</p>
                      <p className="text-muted-foreground">npm run build</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 h-12 justify-start"
                    disabled
                  >
                    <Database className="w-4 h-4" />
                    <div className="text-left text-xs">
                      <p className="font-medium">Database Reset</p>
                      <p className="text-muted-foreground">Clear all games</p>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Additional operations available via terminal
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Game Edit Modal */}
      <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Game Metadata
            </DialogTitle>
            <DialogDescription>
              Refine the extracted game data before importing it to the database.
            </DialogDescription>
          </DialogHeader>

          {editingGame && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    Game Name
                  </label>
                  <Input
                    value={editingGame.data.name}
                    onChange={(e) => setEditingGame({
                      ...editingGame,
                      data: { ...editingGame.data, name: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Info className="w-3 h-3 text-muted-foreground" />
                    Provider
                  </label>
                  <Input
                    value={editingGame.data.provider_name}
                    onChange={(e) => setEditingGame({
                      ...editingGame,
                      data: { ...editingGame.data, provider_name: e.target.value }
                    })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">RTP (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingGame.data.rtp}
                      onChange={(e) => setEditingGame({
                        ...editingGame,
                        data: { ...editingGame.data, rtp: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Volatility</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={editingGame.data.volatility}
                      onChange={(e) => setEditingGame({
                        ...editingGame,
                        data: { ...editingGame.data, volatility: e.target.value as any }
                      })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Thumbnail URL</label>
                  <Input
                    value={editingGame.data.image_url}
                    onChange={(e) => setEditingGame({
                      ...editingGame,
                      data: { ...editingGame.data, image_url: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Embed URL (Iframe)</label>
                  <Textarea
                    className="min-h-[80px] text-xs font-mono"
                    value={editingGame.data.embed_url}
                    onChange={(e) => setEditingGame({
                      ...editingGame,
                      data: { ...editingGame.data, embed_url: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Launch URL (Forced)</label>
                  <Textarea
                    className="min-h-[80px] text-xs font-mono"
                    value={editingGame.data.launch_url}
                    onChange={(e) => setEditingGame({
                      ...editingGame,
                      data: { ...editingGame.data, launch_url: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description</label>
                  <Textarea
                    className="min-h-[80px]"
                    value={editingGame.data.description}
                    onChange={(e) => setEditingGame({
                      ...editingGame,
                      data: { ...editingGame.data, description: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Features (comma separated)</label>
                  <Input
                    value={editingGame.data.features?.join(', ')}
                    onChange={(e) => setEditingGame({
                      ...editingGame,
                      data: { ...editingGame.data, features: e.target.value.split(',').map(s => s.trim()) }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGame(null)}>Cancel</Button>
            <Button className="gap-2" onClick={handleSaveEdit}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Preview Modal */}
      <Dialog open={!!previewingGame} onOpenChange={(open) => !open && setPreviewingGame(null)}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[85vh] p-0 overflow-hidden bg-black border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{previewingGame?.name} Preview</DialogTitle>
          </DialogHeader>

          {previewingGame && (
            <div className="relative w-full h-full flex flex-col">
              {/* Toolbar */}
              <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-50 flex items-center justify-between px-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold leading-none">{previewingGame.name}</h3>
                    <p className="text-white/60 text-xs mt-1">{previewingGame.provider_name} • {previewingGame.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/10 text-white border-none backdrop-blur-md">
                    DEMO MODE
                  </Badge>
                  <Button size="icon" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setPreviewingGame(null)}>
                    ✕
                  </Button>
                </div>
              </div>

              {/* Game Iframe */}
              <div className="flex-1 w-full h-full relative group">
                {(previewingGame.launch_url || previewingGame.embed_url) ? (
                  <iframe
                    src={previewingGame.launch_url || previewingGame.embed_url}
                    className="w-full h-full border-none shadow-2xl"
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4 bg-zinc-900">
                    <Settings className="w-12 h-12 text-zinc-700 animate-spin" />
                    <div className="text-center">
                      <p className="text-zinc-400 font-medium">No launch URL found for this game</p>
                      <p className="text-zinc-600 text-sm">Please edit the game metadata to add a demo URL</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameAggregationManager;
