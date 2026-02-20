import { query } from './server/db/connection.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function checkGame() {
  try {
    const res = await query("SELECT id, name, embed_url, enabled FROM games WHERE name LIKE '%God of Storms%'");
    console.log('Game Data:', JSON.stringify(res.rows, null, 2));
    
    if (res.rows.length > 0) {
      const gameId = res.rows[0].id;
      const compliance = await query("SELECT * FROM game_compliance WHERE game_id = $1", [gameId]);
      console.log('Compliance Data:', JSON.stringify(compliance.rows, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkGame();
