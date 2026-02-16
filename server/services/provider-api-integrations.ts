import axios, { AxiosError } from 'axios';
import { query } from '../db/connection';

/**
 * Provider API Integration Service
 * Handles connections to major slot game providers
 */

export interface ProviderGame {
  id: string;
  name: string;
  description?: string;
  rtp?: number;
  volatility?: 'Low' | 'Medium' | 'High';
  provider: string;
  provider_game_id: string;
  image_url?: string;
  max_paylines?: number;
  release_date?: string;
  theme?: string;
}

export interface ProviderConfig {
  api_endpoint: string;
  api_key?: string;
  api_secret?: string;
  timeout?: number;
  rate_limit?: number;
}

interface ProviderAdapter {
  name: string;
  slug: string;
  fetchGames: (config: ProviderConfig) => Promise<ProviderGame[]>;
  validateConnection: (config: ProviderConfig) => Promise<boolean>;
  mapToGame: (externalGame: any) => Partial<ProviderGame>;
}

// ===== PRAGMATIC PLAY ADAPTER =====
const PragmaticPlayAdapter: ProviderAdapter = {
  name: 'Pragmatic Play',
  slug: 'pragmatic',
  fetchGames: async (config: ProviderConfig) => {
    try {
      console.log('[PragmaticPlay] Fetching games...');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (config.api_key) {
        headers['X-API-Key'] = config.api_key;
      }

      const response = await axios.get(`${config.api_endpoint}/games/slots`, {
        headers,
        timeout: config.timeout || 15000,
      });

      const games = response.data.games || response.data || [];
      console.log(`[PragmaticPlay] Fetched ${games.length} games`);

      return games.map((game: any) => ({
        id: game.game_id || game.id,
        name: game.game_name || game.name,
        description: game.description || '',
        rtp: game.rtp ? parseFloat(String(game.rtp)) : 96.0,
        volatility: PragmaticPlayAdapter.mapVolatility(game.volatility || 'Medium'),
        provider: 'Pragmatic Play',
        provider_game_id: game.game_id || game.id,
        image_url: game.image_url || game.thumbnail,
        max_paylines: game.paylines || game.max_paylines,
        release_date: game.release_date,
        theme: game.theme || game.category,
      }));
    } catch (error) {
      console.error('[PragmaticPlay] Error fetching games:', (error as Error).message);
      throw error;
    }
  },
  validateConnection: async (config: ProviderConfig) => {
    try {
      const headers: Record<string, string> = {};
      if (config.api_key) {
        headers['X-API-Key'] = config.api_key;
      }

      const response = await axios.get(`${config.api_endpoint}/health`, {
        headers,
        timeout: 10000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  },
  mapToGame: (externalGame: any) => ({
    name: externalGame.game_name || externalGame.name,
    description: externalGame.description,
    rtp: externalGame.rtp,
    volatility: PragmaticPlayAdapter.mapVolatility(externalGame.volatility),
    image_url: externalGame.image_url,
    max_paylines: externalGame.paylines,
  }),
  mapVolatility: (vol: string): 'Low' | 'Medium' | 'High' => {
    const volStr = String(vol).toLowerCase();
    if (volStr.includes('low')) return 'Low';
    if (volStr.includes('high')) return 'High';
    return 'Medium';
  },
};

// ===== MICROGAMING ADAPTER =====
const MicrogamingAdapter: ProviderAdapter = {
  name: 'Microgaming',
  slug: 'microgaming',
  fetchGames: async (config: ProviderConfig) => {
    try {
      console.log('[Microgaming] Fetching games...');

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (config.api_key) {
        headers['Authorization'] = `Bearer ${config.api_key}`;
      }

      const response = await axios.get(`${config.api_endpoint}/games`, {
        headers,
        timeout: config.timeout || 15000,
      });

      const games = response.data.data || response.data || [];
      console.log(`[Microgaming] Fetched ${games.length} games`);

      return games.map((game: any) => ({
        id: game.gameId || game.id,
        name: game.gameName || game.name,
        description: game.description || '',
        rtp: game.rtp ? parseFloat(String(game.rtp)) : 96.0,
        volatility: MicrogamingAdapter.mapVolatility(game.variance || game.volatility || 'Medium'),
        provider: 'Microgaming',
        provider_game_id: game.gameId || game.id,
        image_url: game.imageUrl || game.image,
        max_paylines: game.lines || game.paylines,
        release_date: game.releaseDate,
        theme: game.type || game.theme,
      }));
    } catch (error) {
      console.error('[Microgaming] Error fetching games:', (error as Error).message);
      throw error;
    }
  },
  validateConnection: async (config: ProviderConfig) => {
    try {
      const headers: Record<string, string> = {};
      if (config.api_key) {
        headers['Authorization'] = `Bearer ${config.api_key}`;
      }

      const response = await axios.get(`${config.api_endpoint}/status`, {
        headers,
        timeout: 10000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  },
  mapToGame: (externalGame: any) => ({
    name: externalGame.gameName || externalGame.name,
    description: externalGame.description,
    rtp: externalGame.rtp,
    volatility: MicrogamingAdapter.mapVolatility(externalGame.variance),
    image_url: externalGame.imageUrl,
    max_paylines: externalGame.lines,
  }),
  mapVolatility: (variance: string): 'Low' | 'Medium' | 'High' => {
    const varStr = String(variance).toLowerCase();
    if (varStr.includes('low')) return 'Low';
    if (varStr.includes('high') || varStr.includes('ultra')) return 'High';
    return 'Medium';
  },
};

// ===== NETENT ADAPTER =====
const NetEntAdapter: ProviderAdapter = {
  name: 'NetEnt',
  slug: 'netent',
  fetchGames: async (config: ProviderConfig) => {
    try {
      console.log('[NetEnt] Fetching games...');

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (config.api_key) {
        headers['Authorization'] = `Basic ${Buffer.from(`${config.api_key}:${config.api_secret || ''}`).toString('base64')}`;
      }

      const response = await axios.get(`${config.api_endpoint}/api/games`, {
        headers,
        timeout: config.timeout || 15000,
      });

      const games = response.data.games || response.data || [];
      console.log(`[NetEnt] Fetched ${games.length} games`);

      return games.map((game: any) => ({
        id: game.gameId || game.id,
        name: game.gameName || game.name,
        description: game.description || '',
        rtp: game.rtp ? parseFloat(String(game.rtp)) : 96.0,
        volatility: NetEntAdapter.mapVolatility(game.volatility || 'Medium'),
        provider: 'NetEnt',
        provider_game_id: game.gameId || game.id,
        image_url: game.imageUrl || game.image,
        max_paylines: game.payLines || game.paylines,
        release_date: game.releaseDate,
        theme: game.theme,
      }));
    } catch (error) {
      console.error('[NetEnt] Error fetching games:', (error as Error).message);
      throw error;
    }
  },
  validateConnection: async (config: ProviderConfig) => {
    try {
      const headers: Record<string, string> = {};
      if (config.api_key) {
        headers['Authorization'] = `Basic ${Buffer.from(`${config.api_key}:${config.api_secret || ''}`).toString('base64')}`;
      }

      const response = await axios.get(`${config.api_endpoint}/api/status`, {
        headers,
        timeout: 10000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  },
  mapToGame: (externalGame: any) => ({
    name: externalGame.gameName || externalGame.name,
    description: externalGame.description,
    rtp: externalGame.rtp,
    volatility: NetEntAdapter.mapVolatility(externalGame.volatility),
    image_url: externalGame.imageUrl,
    max_paylines: externalGame.payLines,
  }),
  mapVolatility: (vol: string): 'Low' | 'Medium' | 'High' => {
    const volStr = String(vol).toLowerCase();
    if (volStr.includes('low')) return 'Low';
    if (volStr.includes('high') || volStr.includes('extreme')) return 'High';
    return 'Medium';
  },
};

// ===== PROVIDER REGISTRY =====
const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  'pragmatic': PragmaticPlayAdapter,
  'microgaming': MicrogamingAdapter,
  'netent': NetEntAdapter,
};

/**
 * Fetch games from a specific provider
 */
export async function fetchProviderGames(
  providerSlug: string,
  config: ProviderConfig
): Promise<ProviderGame[]> {
  const adapter = PROVIDER_ADAPTERS[providerSlug.toLowerCase()];
  if (!adapter) {
    throw new Error(`Unknown provider: ${providerSlug}`);
  }

  return adapter.fetchGames(config);
}

/**
 * Validate provider connection
 */
export async function validateProviderConnection(
  providerSlug: string,
  config: ProviderConfig
): Promise<boolean> {
  const adapter = PROVIDER_ADAPTERS[providerSlug.toLowerCase()];
  if (!adapter) {
    throw new Error(`Unknown provider: ${providerSlug}`);
  }

  return adapter.validateConnection(config);
}

/**
 * Sync provider games to database
 */
export async function syncProviderGamesToDb(
  providerId: number,
  providerSlug: string,
  config: ProviderConfig,
  importedBy?: number
): Promise<{
  imported: number;
  updated: number;
  failed: number;
  total_processed: number;
}> {
  const startTime = Date.now();
  let imported = 0;
  let updated = 0;
  let failed = 0;

  try {
    console.log(`[ProviderSync] Starting sync for provider: ${providerSlug}`);

    // Mark import as in progress
    const importHistoryResult = await query(
      `INSERT INTO game_import_history (import_type, provider, games_imported, status)
       VALUES ($1, $2, 0, 'in_progress')
       RETURNING id`,
      ['provider_api', providerSlug]
    );
    const importId = importHistoryResult.rows[0]?.id;

    // Fetch games from provider
    const providerGames = await fetchProviderGames(providerSlug, config);

    // Process each game
    for (const providerGame of providerGames) {
      try {
        // Check if game already exists
        const existingGame = await query(
          'SELECT id FROM games WHERE name = $1 AND provider = $2',
          [providerGame.name, providerGame.provider]
        );

        let gameId: number;

        if (existingGame.rows.length > 0) {
          // Update existing game
          gameId = existingGame.rows[0].id;
          await query(
            `UPDATE games SET 
             rtp = $1, volatility = $2, description = $3, image_url = $4, 
             max_paylines = $5, theme = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7`,
            [
              providerGame.rtp,
              providerGame.volatility,
              providerGame.description,
              providerGame.image_url,
              providerGame.max_paylines,
              providerGame.theme,
              gameId
            ]
          );
          updated++;
          console.log(`[ProviderSync] Updated: ${providerGame.name}`);
        } else {
          // Insert new game
          const result = await query(
            `INSERT INTO games (name, category, provider, rtp, volatility, description, 
             image_url, max_paylines, theme, provider_game_id, enabled)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
             RETURNING id`,
            [
              providerGame.name,
              'Slots',
              providerGame.provider,
              providerGame.rtp,
              providerGame.volatility,
              providerGame.description,
              providerGame.image_url,
              providerGame.max_paylines,
              providerGame.theme,
              providerGame.provider_game_id
            ]
          );
          gameId = result.rows[0].id;
          imported++;
          console.log(`[ProviderSync] Imported: ${providerGame.name}`);
        }

        // Store additional metadata
        if (providerGame.release_date) {
          await query(
            'INSERT INTO game_config (game_id, config_key, config_value) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [gameId, 'release_date', JSON.stringify(providerGame.release_date)]
          );
        }
      } catch (err) {
        console.error(`[ProviderSync] Error processing game ${providerGame.name}:`, (err as Error).message);
        failed++;
      }
    }

    // Update import history
    if (importId) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await query(
        `UPDATE game_import_history SET 
         games_imported = $1, games_updated = $2, games_failed = $3, status = 'completed',
         completed_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [imported, updated, failed, importId]
      );
    }

    console.log(`[ProviderSync] Complete: ${imported} imported, ${updated} updated, ${failed} failed`);

    return {
      imported,
      updated,
      failed,
      total_processed: imported + updated + failed,
    };
  } catch (error) {
    console.error(`[ProviderSync] Error:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get all registered providers
 */
export function getRegisteredProviders() {
  return Object.entries(PROVIDER_ADAPTERS).map(([slug, adapter]) => ({
    slug,
    name: adapter.name,
    type: 'slots',
  }));
}

/**
 * Test provider configuration
 */
export async function testProviderConfig(
  providerSlug: string,
  config: ProviderConfig
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const isValid = await validateProviderConnection(providerSlug, config);
    if (!isValid) {
      return {
        success: false,
        message: 'Connection validation failed',
      };
    }

    const games = await fetchProviderGames(providerSlug, config);
    return {
      success: true,
      message: `Successfully connected to ${providerSlug}. Found ${games.length} games.`,
      details: { gameCount: games.length },
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}
