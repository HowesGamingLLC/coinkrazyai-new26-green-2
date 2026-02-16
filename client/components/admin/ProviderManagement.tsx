import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus, Trash2, Edit2, RefreshCw, Check, X, AlertCircle, Loader, Eye, Download, Upload, Database
} from 'lucide-react';
import { toast } from 'sonner';
import { GameProvider, ProviderCreateRequest } from '@shared/api';

interface ProviderManagementProps {
  onProviderSelect?: (provider: GameProvider) => void;
}

export function ProviderManagement({ onProviderSelect }: ProviderManagementProps) {
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<GameProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [syncingProviderId, setSyncingProviderId] = useState<number | null>(null);
  const [newProvider, setNewProvider] = useState<Partial<ProviderCreateRequest>>({
    type: 'slots'
  });

  // Fetch providers
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/v2/aggregation/providers');
      const data = await response.json();

      if (data.success) {
        setProviders(data.data);
      } else {
        toast.error('Failed to load providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Error fetching providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    try {
      if (!newProvider.name || !newProvider.slug || !newProvider.type) {
        toast.error('Name, slug, and type are required');
        return;
      }

      setIsSaving(true);
      const response = await fetch('/api/admin/v2/aggregation/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Provider created successfully');
        setProviders([...providers, data.data]);
        setNewProvider({ type: 'slots' });
        setShowNewForm(false);
      } else {
        toast.error(data.error || 'Failed to create provider');
      }
    } catch (error) {
      console.error('Error creating provider:', error);
      toast.error('Error creating provider');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!editingProvider) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/v2/aggregation/providers/${editingProvider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProvider)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Provider updated successfully');
        setProviders(providers.map(p => p.id === editingProvider.id ? data.data : p));
        setEditingProvider(null);
      } else {
        toast.error(data.error || 'Failed to update provider');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('Error updating provider');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProvider = async (providerId: number) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      const response = await fetch(`/api/admin/v2/aggregation/providers/${providerId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Provider deleted successfully');
        setProviders(providers.filter(p => p.id !== providerId));
      } else {
        toast.error(data.error || 'Failed to delete provider');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Error deleting provider');
    }
  };

  const handleSyncProvider = async (providerId: number) => {
    try {
      setSyncingProviderId(providerId);
      const response = await fetch(`/api/admin/v2/aggregation/providers/${providerId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 }) // Replace with actual user ID
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Sync started in background');
        // Refresh providers after a delay
        setTimeout(fetchProviders, 2000);
      } else {
        toast.error(data.error || 'Failed to start sync');
      }
    } catch (error) {
      console.error('Error syncing provider:', error);
      toast.error('Error syncing provider');
    } finally {
      setSyncingProviderId(null);
    }
  };

  const handleTestConnection = async (providerId: number) => {
    try {
      const response = await fetch(`/api/admin/v2/aggregation/providers/${providerId}/test`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success && data.data.success) {
        toast.success(data.data.message);
      } else {
        toast.error(data.data?.message || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing provider:', error);
      toast.error('Error testing provider');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-400">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Game Providers</h3>
          <p className="text-gray-400 text-sm mt-1">Manage external game providers and sync games</p>
        </div>
        <Button
          onClick={() => setShowNewForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* New Provider Form */}
      {showNewForm && (
        <Card className="border-primary/20 bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Add New Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Provider Name"
                value={newProvider.name || ''}
                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Slug (e.g., pragmatic-play)"
                value={newProvider.slug || ''}
                onChange={(e) => setNewProvider({ ...newProvider, slug: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              />
            </div>
            <textarea
              placeholder="Description"
              value={newProvider.description || ''}
              onChange={(e) => setNewProvider({ ...newProvider, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="API Endpoint"
                value={newProvider.api_endpoint || ''}
                onChange={(e) => setNewProvider({ ...newProvider, api_endpoint: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="API Key"
                value={newProvider.api_key || ''}
                onChange={(e) => setNewProvider({ ...newProvider, api_key: e.target.value })}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateProvider}
                disabled={isSaving}
                className="flex-1 bg-primary"
              >
                {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Provider
              </Button>
              <Button
                onClick={() => setShowNewForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Providers List */}
      <div className="grid gap-4">
        {providers.length === 0 ? (
          <Card className="border-border/30">
            <CardContent className="p-8 text-center">
              <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No providers configured yet</p>
              <p className="text-gray-500 text-sm mt-2">Add a provider to start importing games from external sources</p>
            </CardContent>
          </Card>
        ) : (
          providers.map(provider => (
            <Card key={provider.id} className="border-border/30 hover:border-primary/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Provider Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-white">{provider.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        provider.is_enabled
                          ? 'bg-green-900/30 text-green-400 border border-green-700'
                          : 'bg-red-900/30 text-red-400 border border-red-700'
                      }`}>
                        {provider.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        provider.status === 'connected'
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
                          : provider.status === 'syncing'
                            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                            : provider.status === 'error'
                              ? 'bg-red-900/30 text-red-400 border border-red-700'
                              : 'bg-gray-700 text-gray-400 border border-gray-600'
                      }`}>
                        {provider.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{provider.description}</p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="text-gray-300 font-semibold capitalize">{provider.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Games</p>
                        <p className="text-amber-400 font-semibold">{provider.total_games}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Sync</p>
                        <p className="text-gray-300">
                          {provider.last_sync_at 
                            ? new Date(provider.last_sync_at).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sync Interval</p>
                        <p className="text-gray-300">{provider.sync_interval_minutes} min</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleTestConnection(provider.id)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      onClick={() => handleSyncProvider(provider.id)}
                      disabled={syncingProviderId === provider.id}
                      size="sm"
                      className="text-xs bg-primary/80 hover:bg-primary"
                    >
                      {syncingProviderId === provider.id ? (
                        <Loader className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Sync
                    </Button>
                    <Button
                      onClick={() => onProviderSelect?.(provider)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => setEditingProvider(provider)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteProvider(provider.id)}
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gray-900 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white">Edit Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={editingProvider.name || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={editingProvider.description || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Enabled</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProvider({ ...editingProvider, is_enabled: true })}
                    className={`flex-1 px-3 py-2 rounded text-sm font-semibold ${
                      editingProvider.is_enabled
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Yes
                  </button>
                  <button
                    onClick={() => setEditingProvider({ ...editingProvider, is_enabled: false })}
                    className={`flex-1 px-3 py-2 rounded text-sm font-semibold ${
                      !editingProvider.is_enabled
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    No
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateProvider}
                  disabled={isSaving}
                  className="flex-1 bg-primary"
                >
                  {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save
                </Button>
                <Button
                  onClick={() => setEditingProvider(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
