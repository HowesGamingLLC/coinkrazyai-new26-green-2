import { query } from '../db/connection';
import * as providerDb from '../db/providers';

/**
 * Mock provider integrations
 * In production, these would connect to real API endpoints
 */

interface ProviderAdapter {
  fetchGames: () => Promise<any[]>;
  mapGameToDb: (externalGame: any) => any;
}

const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  'pragmatic': {
    fetchGames: async () => {
      // Mock Pragmatic Play games
      return [
        {
          externalId: 'gates-of-olympus',
          name: 'Gates of Olympus',
          description: 'Greek mythology themed slot with multiplier features',
          rtp: 96.5,
          volatility: 'High',
          type: 'Slots',
          imageUrl: 'https://example.com/gates-of-olympus.jpg'
        },
        {
          externalId: 'sweet-bonanza',
          name: 'Sweet Bonanza',
          description: 'Candy-filled slot with sweet wins',
          rtp: 96.48,
          volatility: 'High',
          type: 'Slots',
          imageUrl: 'https://example.com/sweet-bonanza.jpg'
        },
        {
          externalId: 'big-bass-bonanza',
          name: 'Big Bass Bonanza',
          description: 'Fishing-themed slot with big bonuses',
          rtp: 96.7,
          volatility: 'High',
          type: 'Slots',
          imageUrl: 'https://example.com/big-bass-bonanza.jpg'
        }
      ];
    },
    mapGameToDb: (game) => ({
      name: game.name,
      category: 'Slots',
      provider: 'Pragmatic',
      rtp: game.rtp,
      volatility: game.volatility,
      description: game.description,
      image_url: game.imageUrl,
      enabled: true
    })
  },
  'elk-studios': {
    fetchGames: async () => {
      return [
        {
          externalId: 'wild-wild-west',
          name: 'Wild Wild West',
          description: 'Western adventure with wild features',
          rtp: 96.1,
          volatility: 'Medium',
          type: 'Slots',
          imageUrl: 'https://example.com/wild-west.jpg'
        }
      ];
    },
    mapGameToDb: (game) => ({
      name: game.name,
      category: 'Slots',
      provider: 'ELK Studios',
      rtp: game.rtp,
      volatility: game.volatility,
      description: game.description,
      image_url: game.imageUrl,
      enabled: true
    })
  },
  'red-tiger': {
    fetchGames: async () => {
      return [
        {
          externalId: 'dragon-boyz',
          name: 'Dragon Boyz',
          description: 'Dragon-themed adventure with epic multipliers',
          rtp: 96.5,
          volatility: 'High',
          type: 'Slots',
          imageUrl: 'https://example.com/dragon-boyz.jpg'
        }
      ];
    },
    mapGameToDb: (game) => ({
      name: game.name,
      category: 'Slots',
      provider: 'Red Tiger Gaming',
      rtp: game.rtp,
      volatility: game.volatility,
      description: game.description,
      image_url: game.imageUrl,
      enabled: true
    })
  }
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

    // Get adapter for provider
    const adapter = PROVIDER_ADAPTERS[provider.slug.toLowerCase()];
    if (!adapter) {
      throw new Error(`No adapter found for provider: ${provider.name}`);
    }

    // Fetch games from external provider
    const externalGames = await adapter.fetchGames();
    console.log(`[ProviderSync] Fetched ${externalGames.length} games from ${provider.name}`);

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    // Process each game
    for (const externalGame of externalGames) {
      try {
        // Map to database format
        const dbGame = adapter.mapGameToDb(externalGame);

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
          console.log(`[ProviderSync] Updated game: ${dbGame.name}`);
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
          console.log(`[ProviderSync] Imported game: ${dbGame.name}`);
        }

        // Create/update provider game mapping
        await providerDb.upsertProviderGame(
          providerId,
          gameId,
          externalGame.externalId,
          externalGame.name,
          { source: 'external_api' }
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
  return Object.entries(PROVIDER_ADAPTERS).map(([slug, adapter]) => ({
    slug,
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    type: 'slots'
  }));
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

    const adapter = PROVIDER_ADAPTERS[provider.slug.toLowerCase()];
    if (!adapter) {
      return { success: false, message: `No adapter found for provider: ${provider.name}` };
    }

    // Try to fetch games as a connection test
    const games = await adapter.fetchGames();
    return {
      success: true,
      message: `Connected successfully. Found ${games.length} games.`,
      gameCount: games.length
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
