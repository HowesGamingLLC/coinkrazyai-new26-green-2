import { query } from './server/db/connection';

async function countMissingEmbeds() {
  try {
    const result = await query(
      "SELECT COUNT(*) as count FROM games WHERE embed_url IS NULL OR embed_url = ''"
    );
    console.log(`Games with missing/null embed_url: ${result.rows[0].count}`);
    
    const sampleResult = await query(
      "SELECT id, name, provider, category FROM games WHERE embed_url IS NULL OR embed_url = '' LIMIT 10"
    );
    console.log('Sample missing games:', JSON.stringify(sampleResult.rows, null, 2));
    
  } catch (error) {
    console.error('Error counting missing embeds:', error);
  } finally {
    process.exit(0);
  }
}

countMissingEmbeds();
