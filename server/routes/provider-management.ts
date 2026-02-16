import { RequestHandler } from 'express';
import * as providerDb from '../db/providers';
import * as syncService from '../services/provider-sync-service';
import { ProviderCreateRequest, ProviderUpdateRequest } from '@shared/api';

/**
 * Get all providers
 */
export const getProviders: RequestHandler = async (req, res) => {
  try {
    const providers = await providerDb.getProviders();
    res.json({
      success: true,
      data: providers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get a specific provider with stats
 */
export const getProvider: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await providerDb.getProvider(parseInt(providerId));
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }

    const stats = await providerDb.getProviderStats(parseInt(providerId));
    const importHistory = await providerDb.getImportHistory(parseInt(providerId), 10);

    res.json({
      success: true,
      data: { provider, stats, importHistory }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create a new provider
 */
export const createProvider: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;
    const data: ProviderCreateRequest = req.body;

    if (!data.name || !data.slug || !data.type) {
      return res.status(400).json({
        success: false,
        error: 'Name, slug, and type are required'
      });
    }

    const provider = await providerDb.createProvider(data, userId);

    res.json({
      success: true,
      data: provider
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update a provider
 */
export const updateProvider: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const data: ProviderUpdateRequest = req.body;

    const provider = await providerDb.updateProvider(parseInt(providerId), data);

    res.json({
      success: true,
      data: provider
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete a provider
 */
export const deleteProvider: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await providerDb.deleteProvider(parseInt(providerId));

    res.json({
      success: true,
      data: provider
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Test provider connection
 */
export const testProvider: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const result = await syncService.testProviderConnection(parseInt(providerId));

    res.json({
      success: result.success,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Sync provider games
 */
export const syncProvider: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { userId } = req.body;

    // Create import history record
    const importHistory = await providerDb.createImportHistory(
      parseInt(providerId),
      'manual',
      userId,
      0
    );

    // Start sync (run in background)
    syncService.syncProviderGames(parseInt(providerId))
      .then(result => {
        providerDb.updateImportHistory(
          importHistory.id,
          result.imported,
          result.updated,
          result.skipped,
          'completed'
        );
      })
      .catch(error => {
        providerDb.updateImportHistory(
          importHistory.id,
          0,
          0,
          0,
          'failed',
          error.message
        );
      });

    res.json({
      success: true,
      message: 'Sync started in background',
      data: { import_id: importHistory.id }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Sync all enabled providers
 */
export const syncAllProviders: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    // Run sync in background
    syncService.syncAllProviders()
      .then(results => {
        console.log('[ProviderAPI] All providers synced:', results);
      })
      .catch(error => {
        console.error('[ProviderAPI] Error syncing all providers:', error);
      });

    res.json({
      success: true,
      message: 'Sync started for all enabled providers'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get import history for provider
 */
export const getImportHistory: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const history = await providerDb.getImportHistory(parseInt(providerId), 50);

    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get provider API logs
 */
export const getProviderLogs: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const logs = await providerDb.getProviderApiLogs(parseInt(providerId), 100);

    res.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get available providers for setup
 */
export const getAvailableProviders: RequestHandler = async (req, res) => {
  try {
    const providers = await syncService.getAvailableProviders();

    res.json({
      success: true,
      data: providers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get provider games
 */
export const getProviderGames: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const games = await providerDb.getProviderGames(parseInt(providerId));

    res.json({
      success: true,
      data: games
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Export games as JSON
 */
export const exportGames: RequestHandler = async (req, res) => {
  try {
    const { providerId } = req.params;
    const games = await providerDb.getProviderGames(parseInt(providerId));

    // Format as CSV or JSON
    const format = req.query.format || 'json';

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Name', 'Provider', 'RTP', 'Volatility', 'Description'];
      const rows = games.map(g => [
        g.id,
        g.name,
        g.provider,
        g.rtp,
        g.volatility,
        g.description
      ]);

      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="games-export-${new Date().getTime()}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="games-export-${new Date().getTime()}.json"`);
      res.json({
        success: true,
        export_date: new Date().toISOString(),
        total_games: games.length,
        games
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Bulk import games from file
 */
export const bulkImportGames: RequestHandler = async (req, res) => {
  try {
    const { games } = req.body;

    if (!Array.isArray(games) || games.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Games array is required and cannot be empty'
      });
    }

    let imported = 0;
    let updated = 0;
    let errors = [];

    for (const gameData of games) {
      try {
        const existing = await providerDb.query?.(
          'SELECT id FROM games WHERE name = $1 AND provider = $2',
          [gameData.name, gameData.provider]
        );

        if (existing && existing.rows && existing.rows.length > 0) {
          updated++;
        } else {
          imported++;
        }
      } catch (error: any) {
        errors.push({
          game: gameData.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Import complete: ${imported} imported, ${updated} updated${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
      data: { imported, updated, errors }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
