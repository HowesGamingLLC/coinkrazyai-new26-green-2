import { query } from './server/db/connection.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function updateGame() {
  try {
    // Age of the Gods: God of Storms (Playtech)
    const demoUrl = 'https://cdn.playtech.com/casino/launcher.html?game=pms_gost&mode=demo&language=en&currency=USD';
    
    // Check if game exists
    const checkRes = await query("SELECT id FROM games WHERE name = 'Age of the Gods: God of Storms'");
    
    if (checkRes.rows.length > 0) {
      const gameId = checkRes.rows[0].id;
      await query("UPDATE games SET embed_url = $1 WHERE id = $2", [demoUrl, gameId]);
      console.log(`Updated game ${gameId} with demo URL`);
      
      // Also ensure compliance record exists
      const compCheck = await query("SELECT id FROM game_compliance WHERE game_id = $1", [gameId]);
      if (compCheck.rows.length === 0) {
        await query(
          "INSERT INTO game_compliance (game_id, is_external, is_sweepstake, is_social_casino, currency, min_bet, max_bet, max_win_amount) VALUES ($1, true, true, true, 'SC', 0.10, 5.00, 500.00)",
          [gameId]
        );
        console.log('Added compliance record');
      }
    } else {
      console.log('Game not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

updateGame();
