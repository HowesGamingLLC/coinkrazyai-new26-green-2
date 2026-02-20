import { query } from './server/db/connection.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function checkGames() {
  try {
    const res = await query("SELECT COUNT(*) FROM games WHERE embed_url IS NULL");
    console.log('Games with null embed_url:', res.rows[0].count);
    
    const res2 = await query("SELECT id, name, embed_url FROM games WHERE embed_url IS NOT NULL LIMIT 5");
    console.log('Games with embed_url:', JSON.stringify(res2.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkGames();
