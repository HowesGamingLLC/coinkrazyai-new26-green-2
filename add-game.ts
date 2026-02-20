import { query } from './server/db/connection';

async function addBigJoker() {
  try {
    const game = [
      'Big Joker', 
      'Slots', 
      'External', 
      95.8, 
      'Medium', 
      'Classic fruit-themed slot with a big joker surprise!', 
      true, 
      'https://via.placeholder.com/300x300?text=Big+Joker', 
      'big-joker', 
      'https://free-slots.games/game/BigJokerCT/'
    ];

    await query(
      `INSERT INTO games (name, category, provider, rtp, volatility, description, enabled, image_url, slug, embed_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (slug) DO UPDATE SET embed_url = EXCLUDED.embed_url`,
      game
    );
    console.log('Successfully added Big Joker to the database.');
  } catch (error) {
    console.error('Error adding Big Joker:', error);
  } finally {
    process.exit();
  }
}

addBigJoker();
