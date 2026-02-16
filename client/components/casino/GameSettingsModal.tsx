import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Settings, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GameSettingsModalProps {
  gameId: string | number;
  gameName: string;
  provider: string;
  rtp?: number;
  volatility?: string;
  themeColor?: string;
  minBet?: number;
  maxBet?: number;
  onClose: () => void;
  onSave?: (settings: GameSettings) => void;
}

interface GameSettings {
  rtp: number;
  volatility: string;
  themeColor: string;
  minBet: number;
  maxBet: number;
}

export function GameSettingsModal({
  gameId,
  gameName,
  provider,
  rtp = 96.5,
  volatility = 'Medium',
  themeColor = '#f59e0b',
  minBet = 0.01,
  maxBet = 5.00,
  onClose,
  onSave
}: GameSettingsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    rtp,
    volatility,
    themeColor,
    minBet,
    maxBet
  });

  const volatilityOptions = ['Low', 'Medium', 'High', 'Ultra High'];
  const themeColors = [
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f97316', // Orange
    '#06b6d4'  // Cyan
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate settings
      if (settings.rtp < 80 || settings.rtp > 98) {
        toast.error('RTP must be between 80% and 98%');
        return;
      }
      if (settings.minBet <= 0 || settings.maxBet <= 0) {
        toast.error('Bet amounts must be greater than 0');
        return;
      }
      if (settings.minBet > settings.maxBet) {
        toast.error('Minimum bet cannot exceed maximum bet');
        return;
      }

      // Call parent save handler
      if (onSave) {
        onSave(settings);
      }

      toast.success('Game settings saved successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save game settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-2xl shadow-2xl border border-amber-500/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">{gameName}</h2>
                <p className="text-sm text-amber-100">{provider}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Game Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Return to Player (RTP)</p>
                <p className="text-3xl font-bold text-amber-400">{settings.rtp}%</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Volatility</p>
                <p className="text-2xl font-bold text-blue-400">{settings.volatility}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Min Bet</p>
                <p className="text-2xl font-bold text-green-400">{settings.minBet.toFixed(2)} SC</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Max Bet</p>
                <p className="text-2xl font-bold text-purple-400">{settings.maxBet.toFixed(2)} SC</p>
              </div>
            </div>

            {/* Theme Color */}
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-3">Theme Color</p>
              <div
                className="w-24 h-24 rounded-lg border-2 border-gray-700"
                style={{ backgroundColor: settings.themeColor }}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm font-semibold">Admin Settings</p>
                <p className="text-blue-200 text-xs mt-1">
                  These are the current game configuration settings. Click "Edit" to modify them.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editing View
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl w-full max-w-2xl shadow-2xl border border-amber-500/30 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Edit Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* RTP Setting */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-300">
              Return to Player (RTP): <span className="text-amber-400">{settings.rtp}%</span>
            </label>
            <input
              type="range"
              min="80"
              max="98"
              step="0.1"
              value={settings.rtp}
              onChange={(e) => setSettings({ ...settings, rtp: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>80%</span>
              <span>98%</span>
            </div>
          </div>

          {/* Volatility Setting */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-300">Volatility</label>
            <div className="grid grid-cols-4 gap-2">
              {volatilityOptions.map((vol) => (
                <button
                  key={vol}
                  onClick={() => setSettings({ ...settings, volatility: vol })}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    settings.volatility === vol
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {vol}
                </button>
              ))}
            </div>
          </div>

          {/* Min/Max Bet */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-300">
                Min Bet (SC): <span className="text-green-400">{settings.minBet.toFixed(2)}</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={settings.minBet}
                onChange={(e) => setSettings({ ...settings, minBet: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-300">
                Max Bet (SC): <span className="text-purple-400">{settings.maxBet.toFixed(2)}</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={settings.maxBet}
                onChange={(e) => setSettings({ ...settings, maxBet: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Theme Color Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-300">Theme Color</label>
            <div className="grid grid-cols-8 gap-2">
              {themeColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSettings({ ...settings, themeColor: color })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    settings.themeColor === color ? 'border-white scale-110' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
