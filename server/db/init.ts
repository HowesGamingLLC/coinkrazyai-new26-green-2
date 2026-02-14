import { query } from './connection';
import * as fs from 'fs';
import * as path from 'path';

export const initializeDatabase = async () => {
  try {
    console.log('[DB] Initializing database...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
      }
    }

    console.log('[DB] Schema initialized successfully');

    // Seed data if tables are empty
    await seedDatabase();
  } catch (error) {
    console.error('[DB] Initialization failed:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    // Check if players table has data
    const result = await query('SELECT COUNT(*) as count FROM players');
    
    if (result.rows[0].count === 0) {
      console.log('[DB] Seeding database with sample data...');

      // Seed admin user
      await query(
        `INSERT INTO admin_users (email, password_hash, name, role, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin@coinkrazy.ai', '$2b$10$YJrwu7c8u7c8u7c8u7c8u', 'Admin User', 'admin', 'Active']
      );

      // Seed players
      const players = [
        ['John Doe', 'john@example.com', 5250, 125, 'Active', 'Full', true],
        ['Jane Smith', 'jane@example.com', 12000, 340, 'Active', 'Full', true],
        ['Mike Johnson', 'mike@example.com', 2100, 89, 'Active', 'Intermediate', true],
        ['Sarah Wilson', 'sarah@example.com', 8500, 215, 'Active', 'Full', true],
        ['Tom Brown', 'tom@example.com', 3200, 95, 'Suspended', 'Basic', false],
      ];

      for (const player of players) {
        await query(
          `INSERT INTO players (name, email, gc_balance, sc_balance, status, kyc_level, kyc_verified) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          player
        );
      }

      // Seed games
      const games = [
        ['Mega Spin Slots', 'Slots', 'Internal', 96.5, 'Medium', true],
        ['Diamond Poker Pro', 'Poker', 'Internal', 98.2, 'Low', true],
        ['Bingo Bonanza', 'Bingo', 'Internal', 94.8, 'High', true],
        ['Fruit Frenzy', 'Slots', 'Internal', 95.0, 'Medium', false],
      ];

      for (const game of games) {
        await query(
          `INSERT INTO games (name, category, provider, rtp, volatility, enabled) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          game
        );
      }

      // Seed bonuses
      const bonuses = [
        ['Welcome Bonus 100%', 'Deposit', '$100', 100, 10, 1200],
        ['VIP Reload Bonus', 'Reload', '$50', 50, 50, 500],
        ['Free Spins 50', 'Free Spins', '50 Spins', null, 0, 2000],
      ];

      for (const bonus of bonuses) {
        await query(
          `INSERT INTO bonuses (name, type, amount, percentage, min_deposit, max_claims) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          bonus
        );
      }

      // Seed poker tables
      const pokerTables = [
        ['Diamond Table 1', '$1/$2', 8, 6, 20, 200],
        ['Ruby Table 2', '$5/$10', 8, 5, 100, 1000],
        ['Gold Table 1', '$10/$20', 6, 0, 200, 2000],
        ['Platinum VIP', '$50/$100', 6, 4, 1000, 10000],
      ];

      for (const table of pokerTables) {
        await query(
          `INSERT INTO poker_tables (name, stakes, max_players, current_players, buy_in_min, buy_in_max) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          table
        );
      }

      // Seed bingo games
      const bingoGames = [
        ['Morning Bonanza', '5-line', 42, 1, 500],
        ['Afternoon Special', 'Full Card', 28, 2, 1200],
        ['Evening Rush', '5-line', 0, 1.5, 750],
        ['Night Party', 'Corner', 0, 3, 2000],
      ];

      for (const game of bingoGames) {
        await query(
          `INSERT INTO bingo_games (name, pattern, players, ticket_price, jackpot) 
           VALUES ($1, $2, $3, $4, $5)`,
          game
        );
      }

      // Seed sports events
      const sportsEvents = [
        ['NFL', 'Chiefs vs 49ers', 'Live', 124500, '+2.5'],
        ['NBA', 'Lakers vs Celtics', 'Live', 89200, '-1.5'],
        ['Soccer', 'Manchester United vs Liverpool', 'Upcoming', 234100, '+0.5'],
        ['Tennis', 'Australian Open Final', 'Upcoming', 56800, null],
      ];

      for (const event of sportsEvents) {
        await query(
          `INSERT INTO sports_events (sport, event_name, status, total_bets, line_movement) 
           VALUES ($1, $2, $3, $4, $5)`,
          event
        );
      }

      console.log('[DB] Sample data seeded successfully');
    } else {
      console.log('[DB] Database already contains data, skipping seed');
    }
  } catch (error) {
    console.error('[DB] Seeding failed:', error);
    throw error;
  }
};

// Export initialization for manual run if needed
export default initializeDatabase;
