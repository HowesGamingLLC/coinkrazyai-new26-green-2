import { query } from '../db/connection';
import { ALL_SLOT_GAMES } from '../../shared/slotGamesDatabase';

export async function importSlotGames() {
  console.log('[GameImport] Starting import of', ALL_SLOT_GAMES.length, 'games from shared database...');

  try {
    let imported = 0;
    let skipped = 0;

    for (const game of ALL_SLOT_GAMES) {
      try {
        // Check if game already exists
        const existingGame = await query(
          'SELECT id FROM games WHERE name = $1 AND provider = $2',
          [game.name, game.provider]
        );

        if (existingGame.rows.length > 0) {
          skipped++;
          continue;
        }

        // Generate slug if not present
        const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Insert new game
        const result = await query(
          `INSERT INTO games (
            name, 
            provider, 
            category, 
            image_url, 
            embed_url, 
            rtp, 
            volatility, 
            description,
            enabled,
            slug,
            type,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
           RETURNING id`,
          [
            game.name, 
            game.provider, 
            game.category, 
            game.image_url, 
            game.embed_url, 
            game.rtp, 
            game.volatility, 
            game.description || `${game.name} by ${game.provider}`,
            game.enabled,
            slug,
            game.game_type
          ]
        );

        console.log(`[GameImport] Added: ${game.name} (ID: ${result.rows[0].id})`);
        imported++;
      } catch (gameError: any) {
        console.error(`[GameImport] Failed to add ${game.name}:`, gameError.message);
      }
    }

    console.log(`[GameImport] Import completed! ${imported} games added, ${skipped} skipped.`);
    return { success: true, message: `Import completed: ${imported} added, ${skipped} skipped` };
  } catch (error) {
    console.error('[GameImport] Fatal error:', error);
    throw error;
  }
}

// Run import
importSlotGames()
  .then(() => {
    console.log('[GameImport] All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[GameImport] Error:', error);
    process.exit(1);
  });
