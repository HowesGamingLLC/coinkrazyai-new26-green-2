import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download, Upload, RefreshCw, AlertCircle, CheckCircle, Clock, Loader, Database, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { GameProvider, GameImportHistory } from '@shared/api';
import { ProviderManagement } from './ProviderManagement';

interface GameAggregationDashboardProps {
  activeTab?: string;
}

export function GameAggregationDashboard({ activeTab = 'overview' }: GameAggregationDashboardProps) {
  const [selectedProvider, setSelectedProvider] = useState<GameProvider | null>(null);
  const [importHistory, setImportHistory] = useState<GameImportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    if (selectedProvider) {
      fetchImportHistory();
    }
  }, [selectedProvider]);

  const fetchImportHistory = async () => {
    if (!selectedProvider) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/v2/aggregation/providers/${selectedProvider.id}/history`);
      const data = await response.json();

      if (data.success) {
        setImportHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncingAll(true);
      const response = await fetch('/api/admin/v2/aggregation/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Syncing all providers in background');
      } else {
        toast.error('Failed to start sync');
      }
    } catch (error) {
      console.error('Error syncing all:', error);
      toast.error('Error starting sync');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleExportGames = async () => {
    if (!selectedProvider) {
      toast.error('Please select a provider first');
      return;
    }

    try {
      const response = await fetch(`/api/admin/v2/aggregation/export?providerId=${selectedProvider.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `games-export-${selectedProvider.slug}-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Games exported successfully');
    } catch (error) {
      console.error('Error exporting games:', error);
      toast.error('Error exporting games');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Game Aggregation & Ingestion</h2>
          <p className="text-gray-400 mt-1">Manage external game providers and import games into your casino</p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="bg-primary hover:bg-primary/90"
        >
          {isSyncingAll ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync All Providers
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="providers" className="data-[state=active]:bg-primary">
            Providers
          </TabsTrigger>
          <TabsTrigger value="import-history" className="data-[state=active]:bg-primary">
            Import History
          </TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-primary">
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/30 bg-gradient-to-br from-blue-900/20 to-transparent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Total Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-400">—</p>
                <p className="text-gray-400 text-sm mt-2">Configure external game providers</p>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-gradient-to-br from-green-900/20 to-transparent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Games Imported
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-400">—</p>
                <p className="text-gray-400 text-sm mt-2">From external providers this month</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/30">
            <CardHeader>
              <CardTitle className="text-white">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 flex gap-4">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Get Started with Game Aggregation</p>
                  <ol className="text-gray-300 text-sm space-y-1 mt-2 list-decimal list-inside">
                    <li>Go to the "Providers" tab</li>
                    <li>Click "Add Provider" and configure your first provider</li>
                    <li>Click "Test" to verify the connection</li>
                    <li>Click "Sync" to import games</li>
                    <li>Monitor import history and manage games</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <ProviderManagement onProviderSelect={setSelectedProvider} />
        </TabsContent>

        {/* Import History Tab */}
        <TabsContent value="import-history" className="space-y-4">
          {!selectedProvider ? (
            <Card className="border-border/30">
              <CardContent className="p-8 text-center">
                <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a provider to view import history</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="border-primary/20 bg-gray-800/30">
                <CardHeader>
                  <CardTitle className="text-white">{selectedProvider.name} - Import History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : importHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No import history yet</p>
                  ) : (
                    <div className="space-y-3">
                      {importHistory.map((history) => (
                        <div
                          key={history.id}
                          className="border border-gray-700 rounded-lg p-4 flex items-start justify-between"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="mt-1">
                              {history.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : history.status === 'in_progress' ? (
                                <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                              ) : history.status === 'failed' ? (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold capitalize">{history.import_type} Import</p>
                              <p className="text-gray-400 text-sm">
                                Started: {new Date(history.started_at).toLocaleString()}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {history.status === 'completed' && history.completed_at
                                  ? `Completed in ${history.import_duration_seconds}s`
                                  : history.error_message
                                    ? `Error: ${history.error_message}`
                                    : 'In progress...'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-semibold">{history.total_games_imported} imported</p>
                            <p className="text-blue-400 text-sm">{history.total_games_updated} updated</p>
                            {history.total_games_skipped > 0 && (
                              <p className="text-yellow-400 text-sm">{history.total_games_skipped} skipped</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Card className="border-border/30">
            <CardHeader>
              <CardTitle className="text-white">Import/Export Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export */}
                <div className="border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Download className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Export Games</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Export games from the selected provider as JSON format
                  </p>
                  <Button
                    onClick={handleExportGames}
                    disabled={!selectedProvider}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>

                {/* Bulk Import */}
                <div className="border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Upload className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">Bulk Import</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Import games from a JSON file into your database
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import from File
                  </Button>
                  <p className="text-gray-500 text-xs mt-2">Coming soon</p>
                </div>
              </div>

              {/* Import Instructions */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                <p className="text-white font-semibold">Import File Format (JSON)</p>
                <pre className="bg-gray-900 rounded p-3 text-gray-300 text-xs overflow-x-auto">
{`[
  {
    "name": "Game Name",
    "provider": "Provider Name",
    "rtp": 96.5,
    "volatility": "High",
    "description": "Game description",
    "image_url": "https://..."
  }
]`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
