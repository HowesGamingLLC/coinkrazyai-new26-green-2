import { query } from './server/db/connection';

async function checkGameQuality() {
  try {
    const total = await query("SELECT COUNT(*) FROM games");
    const validNames = await query("SELECT COUNT(*) FROM games WHERE name IS NOT NULL AND name != '' AND name != '404'");
    const withEmbed = await query("SELECT COUNT(*) FROM games WHERE embed_url IS NOT NULL AND embed_url != ''");
    
    console.log(`Total games: ${total.rows[0].count}`);
    console.log(`Games with valid names: ${validNames.rows[0].count}`);
    console.log(`Games with embed URLs: ${withEmbed.rows[0].count}`);
    
    const badGames = await query("SELECT id, name, provider FROM games WHERE name IS NULL OR name = '' OR name = '404' LIMIT 20");
    console.log('Sample bad games:', JSON.stringify(badGames.rows, null, 2));
    
  } catch (error) {
    console.error('Error checking game quality:', error);
  } finally {
    process.exit(0);
  }
}

checkGameQuality();
