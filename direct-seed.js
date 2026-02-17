#!/usr/bin/env node

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    console.log('🌱 Seeding test users directly to database...');
    
    // Hash the test password
    const passwordHash = await bcrypt.hash('testpass123', 10);
    console.log(`✅ Generated password hash (${passwordHash.length} chars)`);
    
    const testPlayers = [
      { username: 'johndoe', name: 'John Doe', email: 'john@example.com', gc: 5250, sc: 125 },
      { username: 'janesmith', name: 'Jane Smith', email: 'jane@example.com', gc: 12000, sc: 340 },
      { username: 'mikejohnson', name: 'Mike Johnson', email: 'mike@example.com', gc: 2100, sc: 89 },
      { username: 'sarahwilson', name: 'Sarah Wilson', email: 'sarah@example.com', gc: 8500, sc: 215 },
    ];

    let created = 0;
    let updated = 0;

    for (const player of testPlayers) {
      try {
        // Check if player exists
        const checkResult = await pool.query(
          'SELECT id FROM players WHERE username = $1',
          [player.username]
        );

        if (checkResult.rows.length > 0) {
          // Update existing
          await pool.query(
            `UPDATE players 
             SET password_hash = $1, status = 'Active', updated_at = NOW() 
             WHERE username = $2`,
            [passwordHash, player.username]
          );
          updated++;
          console.log(`  ✏️  Updated: ${player.username}`);
        } else {
          // Insert new
          await pool.query(
            `INSERT INTO players (username, name, email, password_hash, gc_balance, sc_balance, status, kyc_level, kyc_verified)
             VALUES ($1, $2, $3, $4, $5, $6, 'Active', 'Full', true)`,
            [player.username, player.name, player.email, passwordHash, player.gc, player.sc]
          );
          created++;
          console.log(`  ✨ Created: ${player.username}`);
        }
      } catch (err) {
        console.error(`  ❌ Error with ${player.username}:`, err.message);
      }
    }

    // Verify the hash was saved correctly
    console.log('\n🔍 Verifying password hashes...');
    const verifyResult = await pool.query(
      'SELECT username, password_hash FROM players WHERE username = ANY($1)',
      [['johndoe', 'janesmith']]
    );

    for (const row of verifyResult.rows) {
      const isValid = await bcrypt.compare('testpass123', row.password_hash);
      const status = isValid ? '✅' : '❌';
      console.log(`  ${status} ${row.username}: Hash is ${isValid ? 'VALID' : 'INVALID'}`);
    }

    console.log(`\n📊 Seeding complete!`);
    console.log(`   Created: ${created}, Updated: ${updated}`);
    console.log(`\n🔐 Test Credentials:`);
    console.log(`   Username: johndoe`);
    console.log(`   Password: testpass123`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
