import { query } from './server/db/connection';

async function checkProviders() {
  try {
    const result = await query(
      "SELECT provider, COUNT(*) as count FROM games GROUP BY provider"
    );
    console.log('Games per provider:', JSON.stringify(result.rows, null, 2));
    
    const externalResult = await query(
      "SELECT id, name, embed_url FROM games WHERE provider = 'External' AND (embed_url IS NULL OR embed_url = '') LIMIT 5"
    );
    console.log('Sample External missing games:', JSON.stringify(externalResult.rows, null, 2));

    const pragmaticResult = await query(
      "SELECT id, name, embed_url FROM games WHERE provider = 'Pragmatic' AND (embed_url IS NULL OR embed_url = '') LIMIT 5"
    );
    console.log('Sample Pragmatic missing games:', JSON.stringify(pragmaticResult.rows, null, 2));
    
  } catch (error) {
    console.error('Error checking providers:', error);
  } finally {
    process.exit(0);
  }
}

checkProviders();
