import { RequestHandler } from 'express';
import { query } from '../db/connection';

// TypeScript interface for game import data
export interface GameImportData {
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

// ===== IMPORT SINGLE GAME =====
export const importSingleGame: RequestHandler = async (req, res) => {
  try {
    const gameData = req.body as GameImportData;

    // Validate required fields
    if (!gameData.provider || !gameData.name || !gameData.category) {
      return res.status(400).json({
        error: 'Missing required fields: provider, name, category',
      });
    }

    // Check if game already exists
    const existing = await query(
      'SELECT id FROM games WHERE name = $1 AND provider = $2',
      [gameData.name, gameData.provider]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Game already exists',
        gameId: existing.rows[0].id,
      });
    }

    // Normalize category to database value
    const normalizedCategory = normalizeCategory(gameData.category);

    // Insert game
    const result = await query(
      `INSERT INTO games (
        name,
        provider,
        category,
        rtp,
        volatility,
        enabled,
        description,
        image_url,
        slug,
        series,
        family,
        type,
        embed_url,
        launch_url,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       RETURNING id, name, provider, category, rtp, image_url, slug, series, family, type, embed_url, launch_url, enabled`,
      [
        gameData.name,
        gameData.provider,
        normalizedCategory,
        gameData.rtp || 96.0,
        gameData.volatility || 'medium',
        gameData.enabled !== false,
        gameData.description || `${gameData.name} by ${gameData.provider}`,
        gameData.image_url || gameData.thumbnail || null,
        gameData.slug || null,
        gameData.series || null,
        gameData.family || null,
        gameData.type || null,
        gameData.embed_url || null,
        gameData.embed_url || null, // launch_url
      ]
    );

    const importedGame = result.rows[0];

    // Configure SC wallet
    try {
      await query(
        `INSERT INTO game_compliance (game_id, is_external, is_sweepstake, is_social_casino, currency, max_win_amount, min_bet, max_bet)
         VALUES ($1, true, true, true, 'SC', 20.00, 0.01, 5.00)
         ON CONFLICT (game_id) DO UPDATE SET
            is_external = true,
            is_sweepstake = true,
            is_social_casino = true,
            currency = 'SC'`,
        [importedGame.id]
      );
    } catch (compErr) {
      console.warn(`[GameProviderImport] Failed to configure SC wallet for ${gameData.name}:`, (compErr as Error).message);
    }

    // Log import
    await logImport(
      gameData.provider,
      'single',
      1,
      0,
      `Imported: ${gameData.name}`
    );

    res.json({
      success: true,
      message: `Game "${gameData.name}" imported successfully`,
      game: importedGame,
    });
  } catch (error) {
    console.error('Import single game error:', error);
    res.status(500).json({
      error: 'Failed to import game',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ===== BULK IMPORT GAMES =====
export const bulkImportGamesProvider: RequestHandler = async (req, res) => {
  try {
    const { games } = req.body;

    if (!Array.isArray(games) || games.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: games must be a non-empty array',
      });
    }

    let imported = 0;
    let skipped = 0;
    const errors: Array<{
      game: string;
      provider: string;
      error: string;
    }> = [];
    const importedGames: Array<any> = [];

    for (const gameData of games) {
      try {
        const game = gameData as GameImportData;

        // Validate required fields
        if (!game.provider || !game.name || !game.category) {
          errors.push({
            game: game.name || 'Unknown',
            provider: game.provider || 'Unknown',
            error: 'Missing required fields: provider, name, category',
          });
          continue;
        }

        // Check if game already exists
        const existing = await query(
          'SELECT id FROM games WHERE name = $1 AND provider = $2',
          [game.name, game.provider]
        );

        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        // Normalize category
        const normalizedCategory = normalizeCategory(game.category);

        // Insert game
        const result = await query(
          `INSERT INTO games (
            name,
            provider,
            category,
            rtp,
            volatility,
            enabled,
            description,
            image_url,
            slug,
            series,
            family,
            type,
            embed_url,
            launch_url,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
           RETURNING id, name, provider, category, rtp, image_url, slug, series, family, type, embed_url, launch_url, enabled`,
          [
            game.name,
            game.provider,
            normalizedCategory,
            game.rtp || 96.0,
            game.volatility || 'medium',
            game.enabled !== false,
            game.description || `${game.name} by ${game.provider}`,
            game.image_url || game.thumbnail || null,
            game.slug || null,
            game.series || null,
            game.family || null,
            game.type || null,
            game.embed_url || null,
            game.embed_url || null, // launch_url
          ]
        );

        const importedGame = result.rows[0];
        importedGames.push(importedGame);

        // Configure SC wallet
        try {
          await query(
            `INSERT INTO game_compliance (game_id, is_external, is_sweepstake, is_social_casino, currency, max_win_amount, min_bet, max_bet)
             VALUES ($1, true, true, true, 'SC', 20.00, 0.01, 5.00)
             ON CONFLICT (game_id) DO UPDATE SET
                is_external = true,
                is_sweepstake = true,
                is_social_casino = true,
                currency = 'SC'`,
            [importedGame.id]
          );
        } catch (compErr) {
          console.warn(`[GameProviderImport] Failed to configure SC wallet for ${game.name}:`, (compErr as Error).message);
        }

        imported++;
      } catch (gameError: any) {
        errors.push({
          game: (gameData as GameImportData).name || 'Unknown',
          provider: (gameData as GameImportData).provider || 'Unknown',
          error: gameError.message || 'Unknown error',
        });
      }
    }

    // Log bulk import
    if (imported > 0) {
      const provider = games[0]?.provider || 'Various';
      await logImport(
        provider,
        'bulk',
        imported,
        skipped,
        `Bulk import: ${imported} games added, ${skipped} skipped`
      );
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${imported} games added, ${skipped} skipped${errors.length > 0 ? ', ' + errors.length + ' errors' : ''}`,
      data: {
        total: games.length,
        imported,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        importedGames,
      },
    });
  } catch (error) {
    console.error('Bulk import games error:', error);
    res.status(500).json({
      error: 'Failed to bulk import games',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ===== HELPER FUNCTIONS =====

function normalizeCategory(category: string): string {
  const categoryMap: { [key: string]: string } = {
    slot: 'Slots',
    slots: 'Slots',
    video_slot: 'Slots',
    'video slot': 'Slots',
    classic: 'Classic',
    table: 'Table Games',
    'table game': 'Table Games',
    poker: 'Poker',
    blackjack: 'BlackJack',
    roulette: 'Roulette',
    bingo: 'Bingo',
    casino: 'Casino Games',
    'casino game': 'Casino Games',
    live: 'Live Casino',
    live_casino: 'Live Casino',
    'live casino': 'Live Casino',
    'live dealer': 'Live Casino',
    'live-dealer': 'Live Casino',
    baccarat: 'Baccarat',
  };

  const normalized = categoryMap[category.toLowerCase()];
  return normalized || category;
}

async function logImport(
  provider: string,
  importType: 'single' | 'bulk',
  imported: number,
  skipped: number,
  details: string
): Promise<void> {
  try {
    // Create game_import_history table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS game_import_history (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(255) NOT NULL,
        import_type VARCHAR(50),
        games_imported INTEGER DEFAULT 0,
        games_skipped INTEGER DEFAULT 0,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Log the import
    await query(
      `INSERT INTO game_import_history (provider, import_type, games_imported, games_skipped, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [provider, importType, imported, skipped, details]
    );
  } catch (error) {
    console.error('Failed to log import:', error);
    // Don't throw - import already succeeded, just logging failed
  }
}

// ===== GET IMPORT HISTORY =====
export const getImportHistoryProvider: RequestHandler = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT * FROM game_import_history 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM game_import_history');

    res.json({
      history: result.rows,
      total: parseInt(countResult.rows[0]?.total || '0'),
      limit: parseInt(String(limit)),
      offset: parseInt(String(offset)),
    });
  } catch (error) {
    console.error('Get import history error:', error);
    res.status(500).json({
      error: 'Failed to fetch import history',
    });
  }
};

// ===== GET GAMES BY PROVIDER =====
export const getGamesByProviderRoute: RequestHandler = async (req, res) => {
  try {
    const { provider } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT * FROM games 
       WHERE provider = $1 
       ORDER BY name 
       LIMIT $2 OFFSET $3`,
      [provider, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM games WHERE provider = $1',
      [provider]
    );

    res.json({
      games: result.rows,
      total: parseInt(countResult.rows[0]?.total || '0'),
      provider,
      limit: parseInt(String(limit)),
      offset: parseInt(String(offset)),
    });
  } catch (error) {
    console.error('Get games by provider error:', error);
    res.status(500).json({
      error: 'Failed to fetch games',
    });
  }
};
