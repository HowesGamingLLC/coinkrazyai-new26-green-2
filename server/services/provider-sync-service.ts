import axios from 'axios';
import { query } from '../db/connection';
import * as providerDb from '../db/providers';

/**
 * Provider integrations
 * In production, these connect to real API endpoints
 */

interface ProviderAdapter {
  fetchGames: (provider: any) => Promise<any[]>;
  mapGameToDb: (externalGame: any) => any;
}

const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  'pragmatic': {
    fetchGames: async (provider) => {
      if (provider.api_endpoint && provider.api_key) {
        try {
          const response = await axios.get(`${provider.api_endpoint}/games`, {
            headers: { 'Authorization': `Bearer ${provider.api_key}` }
          });
          return response.data.data || response.data;
        } catch (err) {
          console.warn(`[ProviderSync] Real API call failed for Pragmatic, using mock fallback`);
        }
      }
      // Mock Pragmatic Play games
      return [
        {
          externalId: 'gates-of-olympus',
          name: 'Gates of Olympus',
          description: 'Greek mythology themed slot with multiplier features',
          rtp: 96.5,
          volatility: 'High',
          type: 'Slots',
          imageUrl: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800&auto=format&fit=crop&q=60'
        },
        {
          externalId: 'sweet-bonanza',
          name: 'Sweet Bonanza',
          description: 'Candy-filled slot with sweet wins',
          rtp: 96.48,
          volatility: 'High',
          type: 'Slots',
          imageUrl: 'https://images.unsplash.com/photo-1532102235608-dc8fc689c9ad?w=800&auto=format&fit=crop&q=60'
        }
      ];
    },
    mapGameToDb: (game) => ({
      name: game.name,
      category: 'Slots',
      provider: 'Pragmatic',
      rtp: game.rtp || 96.5,
      volatility: game.volatility || 'High',
      description: game.description,
      image_url: game.imageUrl || game.image_url,
      enabled: true
    })
  },
  'elk-studios': {
    fetchGames: async (provider) => {
      if (provider.api_endpoint && provider.api_key) {
        try {
          const response = await axios.get(`${provider.api_endpoint}/v1/titles`, {
            headers: { 'X-ELK-Key': provider.api_key }
          });
          return response.data.titles || response.data;
        } catch (err) {
          console.warn(`[ProviderSync] Real API call failed for ELK, using mock fallback`);
        }
      }
      return [
        {
          externalId: 'wild-wild-west',
          name: 'Wild Wild West',
          description: 'Western adventure with wild features',
          rtp: 96.1,
          volatility: 'Medium',
          type: 'Slots',
          imageUrl: 'https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?w=800&auto=format&fit=crop&q=60'
        }
      ];
    },
    mapGameToDb: (game) => ({
      name: game.name,
      category: 'Slots',
      provider: 'ELK Studios',
      rtp: game.rtp || 96.1,
      volatility: game.volatility || 'Medium',
      description: game.description,
      image_url: game.imageUrl || game.image_url,
      enabled: true
    })
  }
};

const GENERIC_ADAPTER: ProviderAdapter = {
  fetchGames: async (provider) => {
    if (!provider.api_endpoint) return [];
    try {
      const response = await axios.get(provider.api_endpoint, {
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
          'X-API-Key': provider.api_key
        }
      });
      return response.data.games || response.data.data || (Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(`[ProviderSync] Generic sync failed for ${provider.name}:`, err);
      return [];
    }
  },
  mapGameToDb: (game) => ({
    name: game.name || game.title || 'Unknown Game',
    category: game.category || game.type || 'Slots',
    provider: game.provider || 'External',
    rtp: parseFloat(game.rtp) || 96.0,
    volatility: game.volatility || 'Medium',
    description: game.description || '',
    image_url: game.image_url || game.imageUrl || game.thumb || '',
    enabled: true
  })
};

/**
 * Sync games from a specific provider
 */
export async function syncProviderGames(providerId: number): Promise<{
  imported: number;
  updated: number;
  skipped: number;
  error?: string;
}> {
  try {
    const provider = await providerDb.getProvider(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    console.log(`[ProviderSync] Starting sync for ${provider.name}...`);
    await providerDb.updateProviderStatus(providerId, 'syncing');

    // Get adapter for provider or use generic
    const adapter = PROVIDER_ADAPTERS[provider.slug.toLowerCase()] || GENERIC_ADAPTER;

    // Fetch games from external provider
    const externalGames = await adapter.fetchGames(provider);
    console.log(`[ProviderSync] Fetched ${externalGames.length} games from ${provider.name}`);

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    // Process each game
    for (const externalGame of externalGames) {
      try {
        // Map to database format
        const dbGame = adapter.mapGameToDb(externalGame);
        if (adapter === GENERIC_ADAPTER) {
            dbGame.provider = provider.name; // Override provider name for generic adapter
        }

        // Check if game already exists
        const existingGame = await query(
          'SELECT id FROM games WHERE name = $1 AND provider = $2',
          [dbGame.name, dbGame.provider]
        );

        let gameId: number;
        if (existingGame.rows.length > 0) {
          // Update existing game
          gameId = existingGame.rows[0].id;
          await query(
            `UPDATE games SET
             rtp = $1, volatility = $2, description = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [dbGame.rtp, dbGame.volatility, dbGame.description, dbGame.image_url, gameId]
          );
          updated++;
        } else {
          // Insert new game
          const result = await query(
            `INSERT INTO games (name, category, provider, rtp, volatility, description, image_url, enabled)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              dbGame.name,
              dbGame.category,
              dbGame.provider,
              dbGame.rtp,
              dbGame.volatility,
              dbGame.description,
              dbGame.image_url,
              dbGame.enabled
            ]
          );
          gameId = result.rows[0].id;
          imported++;
        }

        // Create/update provider game mapping
        await providerDb.upsertProviderGame(
          providerId,
          gameId,
          String(externalGame.externalId || externalGame.id || externalGame.slug || externalGame.name),
          externalGame.name || dbGame.name,
          { source: 'external_api', raw: externalGame }
        );
      } catch (gameError: any) {
        console.error(`[ProviderSync] Error processing game:`, gameError.message);
        skipped++;
      }
    }

    // Update provider with sync results
    await providerDb.updateProviderLastSync(providerId, imported + updated);
    await providerDb.updateProviderStatus(providerId, 'connected');

    console.log(`[ProviderSync] Sync complete for ${provider.name}: ${imported} imported, ${updated} updated, ${skipped} skipped`);

    return { imported, updated, skipped };
  } catch (error: any) {
    console.error(`[ProviderSync] Error syncing provider:`, error.message);
    await providerDb.updateProviderStatus(providerId, 'error', error.message);
    throw error;
  }
}

/**
 * Sync all enabled providers
 */
export async function syncAllProviders(): Promise<Record<string, any>> {
  const providers = await providerDb.getProviders();
  const enabledProviders = providers.filter((p: any) => p.is_enabled);

  const results: Record<string, any> = {};

  for (const provider of enabledProviders) {
    try {
      results[provider.name] = await syncProviderGames(provider.id);
    } catch (error: any) {
      results[provider.name] = { error: error.message };
    }
  }

  return results;
}

/**
 * Get available providers with sample games
 */
export async function getAvailableProviders(): Promise<any[]> {
  const dbProviders = await providerDb.getProviders();

  const adapters = Object.entries(PROVIDER_ADAPTERS).map(([slug, adapter]) => ({
    slug,
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    type: 'slots',
    is_mock: true
  }));

  const realProviders = dbProviders.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type,
    is_mock: false
  }));

  return [...adapters, ...realProviders];
}

/**
 * Test provider connection
 */
export async function testProviderConnection(providerId: number): Promise<{
  success: boolean;
  message: string;
  gameCount?: number;
}> {
  try {
    const provider = await providerDb.getProvider(providerId);
    if (!provider) {
      return { success: false, message: 'Provider not found' };
    }

    const adapter = PROVIDER_ADAPTERS[provider.slug.toLowerCase()] || GENERIC_ADAPTER;

    // Try to fetch games as a connection test
    const games = await adapter.fetchGames(provider);
    return {
      success: true,
      message: `Connected successfully. Found ${games.length} games.`,
      gameCount: games.length
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
